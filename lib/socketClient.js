"use client";

import { io } from "socket.io-client";

let socket = null;

export function getSocket(accessToken) {
  if (socket && socket.connected) return socket;

  socket = io(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", {
    auth: { token: accessToken },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    transports: ["websocket", "polling"],
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) socket.disconnect();
  socket = null;
}
