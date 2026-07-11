import mongoose from "mongoose";

// Next.js can re-evaluate this module multiple times in dev; cache the
// connection promise on the global object so we never open more than one.
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/multi_store_oms";
    mongoose.set("strictQuery", true);
    cached.promise = mongoose.connect(MONGO_URI).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
