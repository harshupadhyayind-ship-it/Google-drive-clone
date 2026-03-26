import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;

if (!MONGO_URI) {
  throw new Error("Please define MONGO_URI in env");
}

// Must be set BEFORE connecting.
// strictQuery:true (Mongoose default) silently strips query fields that are
// not present in the compiled schema — this broke our isTrashed filter.
mongoose.set("strictQuery", false);

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}