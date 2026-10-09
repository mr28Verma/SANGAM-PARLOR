import mongoose from "mongoose";

type MongooseCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
declare global { var mongooseCache: MongooseCache | undefined; }

const cache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cache;

export async function connectToDatabase() {
  const uri = process.env.MONGO_URI ?? process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGO_URI is not configured.");
  if (cache.conn) return cache.conn;
  if (!cache.promise) cache.promise = mongoose.connect(uri).then((connection) => connection).catch((error) => {
    cache.promise = null;
    throw error;
  });
  cache.conn = await cache.promise;
  return cache.conn;
}
