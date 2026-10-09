import "server-only";

import { randomUUID } from "node:crypto";
import { Types, type ClientSession } from "mongoose";
import { sendBrevoEmail, EmailDeliveryError } from "./brevo";
import { EmailOutbox, type EmailEventPayload, type EmailEventType } from "./email-outbox-model";
import { buildTransactionalEmail } from "./email-templates";

type AppointmentEmailData = {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
};

function emailPayload(appointment: AppointmentEmailData): EmailEventPayload {
  return {
    name: appointment.name,
    email: appointment.email || "",
    phone: appointment.phone,
    service: appointment.service,
    date: appointment.date,
    time: appointment.time,
    bookingReference: String(appointment._id),
  };
}

export async function enqueueBookingEmails(appointment: AppointmentEmailData, session: ClientSession) {
  const id = String(appointment._id);
  const payload = emailPayload(appointment);
  const events: Array<Record<string, unknown>> = [];
  if (appointment.email) events.push({
    eventKey: `appointment:${id}:booking_received_customer`,
    eventType: "booking_received_customer" satisfies EmailEventType,
    recipientType: "customer",
    recipientEmail: appointment.email,
    appointmentId: id,
    payload,
  });
  events.push({
    eventKey: `appointment:${id}:booking_created_admin`,
    eventType: "booking_created_admin" satisfies EmailEventType,
    recipientType: "admin",
    appointmentId: id,
    payload,
  });
  const created = await EmailOutbox.create(events, { session, ordered: true });
  return created.map((event) => String(event._id));
}

export async function enqueueStatusEmail(appointment: AppointmentEmailData & { status: string }, previousStatus: string, session: ClientSession) {
  if (!appointment.email || (appointment.status !== "confirmed" && appointment.status !== "cancelled")) return null;
  const eventType: EmailEventType = appointment.status === "confirmed" ? "booking_confirmed_customer" : "booking_cancelled_customer";
  const id = String(appointment._id);
  const [event] = await EmailOutbox.create([{
    eventKey: `appointment:${id}:status:${previousStatus}-to-${appointment.status}:${eventType}`,
    eventType,
    recipientType: "customer",
    recipientEmail: appointment.email,
    appointmentId: id,
    payload: emailPayload(appointment),
  }], { session, ordered: true });
  return String(event._id);
}

type DispatchResult = "accepted" | "queued" | "already_sent";

export async function dispatchEmailNotification(id: string, force = false): Promise<DispatchResult> {
  const now = new Date();
  const staleLock = new Date(now.getTime() - 2 * 60_000);
  const lockToken = randomUUID();
  const eligibility = force
    ? [{ status: "pending" }, { status: "processing", lockedAt: { $lte: staleLock } }]
    : [{ status: "pending", nextAttemptAt: { $lte: now } }, { status: "processing", lockedAt: { $lte: staleLock } }];
  const event = await EmailOutbox.findOneAndUpdate(
    { _id: id, $or: eligibility },
    { $set: { status: "processing", lockedAt: now, lockToken }, $inc: { attempts: 1 } },
    { returnDocument: "after" },
  ).lean();

  if (!event) {
    const existing = await EmailOutbox.findById(id).select("status").lean();
    return existing?.status === "sent" ? "already_sent" : "queued";
  }

  try {
    const recipientEmail = event.recipientType === "admin" ? process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ?? "" : event.recipientEmail;
    if (!recipientEmail) throw new EmailDeliveryError("missing_recipient_configuration", true);
    const content = buildTransactionalEmail(event.eventType, event.payload);
    const result = await sendBrevoEmail({
      recipientEmail,
      recipientName: event.recipientType === "admin" ? "Sangam Parlour" : event.payload.name,
      idempotencyKey: event.providerIdempotencyKey,
      content,
    });
    await EmailOutbox.updateOne({ _id: event._id, status: "processing", lockToken }, {
      $set: { status: "sent", providerMessageId: result.messageId, sentAt: new Date(), lastErrorCode: "" },
      $unset: { lockedAt: 1, lockToken: 1 },
    });
    return "accepted";
  } catch (error) {
    const deliveryError = error instanceof EmailDeliveryError ? error : new EmailDeliveryError("notification_delivery_error", true);
    const delayMs = Math.min(60_000 * (2 ** Math.min(event.attempts - 1, 10)), 24 * 60 * 60_000);
    await EmailOutbox.updateOne({ _id: event._id, status: "processing", lockToken }, {
      $set: { status: "pending", nextAttemptAt: new Date(Date.now() + delayMs), lastErrorCode: deliveryError.code },
      $unset: { lockedAt: 1, lockToken: 1 },
    });
    console.error("Transactional email queued for retry", { eventType: event.eventType, errorCode: deliveryError.code });
    return "queued";
  }
}

export async function drainEmailOutbox(limit = 25, force = false) {
  const now = new Date();
  const staleLock = new Date(now.getTime() - 2 * 60_000);
  const events = await EmailOutbox.find({ $or: [
    ...(force ? [{ status: "pending" }] : [{ status: "pending", nextAttemptAt: { $lte: now } }]),
    { status: "processing", lockedAt: { $lte: staleLock } },
  ] }).sort({ nextAttemptAt: 1, createdAt: 1 }).limit(Math.min(Math.max(limit, 1), 100)).select("_id").lean();
  let accepted = 0;
  let queued = 0;
  for (const event of events) {
    const result = await dispatchEmailNotification(String(event._id), force);
    if (result === "accepted" || result === "already_sent") accepted += 1;
    else queued += 1;
  }
  return { attempted: events.length, accepted, queued };
}
