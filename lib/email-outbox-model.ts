import mongoose, { Schema, Types } from "mongoose";
import { randomUUID } from "node:crypto";

export const emailEventTypes = [
  "booking_received_customer",
  "booking_created_admin",
  "booking_confirmed_customer",
  "booking_cancelled_customer",
] as const;
export type EmailEventType = (typeof emailEventTypes)[number];
export type EmailEventPayload = {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  bookingReference: string;
};

const payloadSchema = new Schema<EmailEventPayload>({
  name: { type: String, required: true },
  email: { type: String, default: "" },
  phone: { type: String, required: true },
  service: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  bookingReference: { type: String, required: true },
}, { _id: false });

const emailOutboxSchema = new Schema({
  eventKey: { type: String, required: true, unique: true },
  eventType: { type: String, enum: emailEventTypes, required: true },
  recipientType: { type: String, enum: ["customer", "admin"], required: true },
  recipientEmail: { type: String, default: "" },
  appointmentId: { type: Schema.Types.ObjectId, required: true, ref: "Appointment" },
  payload: { type: payloadSchema, required: true },
  status: { type: String, enum: ["pending", "processing", "sent"], default: "pending", required: true },
  attempts: { type: Number, default: 0, min: 0 },
  nextAttemptAt: { type: Date, default: Date.now, required: true },
  lockedAt: { type: Date, default: null },
  lockToken: { type: String, default: "" },
  providerIdempotencyKey: { type: String, required: true, default: randomUUID },
  providerMessageId: { type: String, default: "" },
  lastErrorCode: { type: String, default: "" },
  sentAt: { type: Date, default: null },
}, { timestamps: true });

emailOutboxSchema.index({ status: 1, nextAttemptAt: 1 });
emailOutboxSchema.index({ status: 1, lockedAt: 1 });

export const EmailOutbox = mongoose.models.EmailOutbox || mongoose.model("EmailOutbox", emailOutboxSchema);
export type EmailOutboxDocument = {
  _id: Types.ObjectId;
  eventKey: string;
  eventType: EmailEventType;
  recipientType: "customer" | "admin";
  recipientEmail: string;
  appointmentId: Types.ObjectId;
  payload: EmailEventPayload;
  status: "pending" | "processing" | "sent";
  attempts: number;
  nextAttemptAt: Date;
  lockedAt: Date | null;
  lockToken: string;
  providerIdempotencyKey: string;
  providerMessageId: string;
  lastErrorCode: string;
};
