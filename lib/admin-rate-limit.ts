import { createHmac } from "node:crypto";
import mongoose, { Schema } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 6;

const attemptSchema = new Schema({
  _id: { type: String },
  attempts: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
}, { versionKey: false });
attemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const LoginAttempt = mongoose.models.AdminLoginAttempt || mongoose.model("AdminLoginAttempt", attemptSchema);

export async function consumeLoginAttempt(ipAddress: string): Promise<"allowed" | "limited" | "unavailable"> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return "unavailable";
  try {
    await connectToDatabase();
    const windowStart = Math.floor(Date.now() / WINDOW_MS) * WINDOW_MS;
    const key = createHmac("sha256", secret).update(`${windowStart}:${ipAddress}`).digest("hex");
    const result = await LoginAttempt.findOneAndUpdate(
      { _id: key },
      { $inc: { attempts: 1 }, $setOnInsert: { expiresAt: new Date(windowStart + WINDOW_MS * 2) } },
      { upsert: true, returnDocument: "after" },
    ).lean();
    return result && result.attempts <= MAX_ATTEMPTS ? "allowed" : "limited";
  } catch (error) {
    // Fail closed if the shared rate limiter cannot be reached.
    console.error("[admin-auth] login rate-limit storage unavailable:", error instanceof Error ? error.name : "unknown error");
    return "unavailable";
  }
}
