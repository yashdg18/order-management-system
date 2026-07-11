/**
 * Custom Node.js server.
 *
 * A plain `next start` cannot host a persistent Socket.IO server (Task 2
 * requires real-time notifications), so we create our own HTTP server,
 * hand every normal request to Next.js, and attach Socket.IO to the same
 * server instance. Because everything runs in a single long-lived Node
 * process, API route handlers can reach the same Socket.IO instance via
 * `global.io` (see lib/socketEmit.js) to emit `new-order` / `status-updated`.
 */
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || `http://${hostname}:${port}`,
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
    },
  });

  // Authenticate every socket connection via the same JWT access token
  // used for API requests.
  io.use((socket, next2) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.toString().split(" ")[1];
      if (!token) return next2(new Error("Authentication required"));

      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET || "dev_access_secret");
      socket.data.userId = payload.userId;
      socket.data.role = payload.role;
      socket.data.storeId = payload.storeId || null;
      next2();
    } catch (err) {
      next2(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`[socket] connected: ${socket.id} (user ${socket.data.userId}, role ${socket.data.role})`);

    if (socket.data.role === "store_manager" && socket.data.storeId) {
      socket.join(`store:${socket.data.storeId}`);
    }
    if (socket.data.role === "admin") {
      socket.join("admins");
    }
    socket.join(`user:${socket.data.userId}`);

    socket.on("join-store-room", (storeId) => {
      if (storeId) socket.join(`store:${storeId}`);
    });
    socket.on("leave-store-room", (storeId) => {
      if (storeId) socket.leave(`store:${storeId}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`[socket] disconnected: ${socket.id} (${reason})`);
    });
  });

  // Expose the io instance to Next.js API route handlers running in the
  // same process (see lib/socketEmit.js).
  global.io = io;

  httpServer.listen(port, () => {
    console.log(`> Order Management System ready on http://${hostname}:${port} (${dev ? "development" : "production"})`);
  });
});
