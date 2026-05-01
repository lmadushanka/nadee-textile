import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalForMongoose = globalThis as unknown as {
  mongoose: MongooseCache | undefined;
};

const cached = globalForMongoose.mongoose ?? { conn: null, promise: null };

if (!globalForMongoose.mongoose) {
  globalForMongoose.mongoose = cached;
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI. Add it to .env.local (see .env.example).",
    );
  }
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      dbName: "nadee-textile",
      serverSelectionTimeoutMS: 12_000,
      // Prefer IPv4; helps some Windows networks where SRV/IPv6 causes ETIMEOUT.
      family: 4,
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}
