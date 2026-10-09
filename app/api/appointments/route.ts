import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { services } from "@/lib/landing-content";
import { Appointment } from "@/lib/appointment-model";
import { connectToDatabase } from "@/lib/mongodb";
import { EmailOutbox } from "@/lib/email-outbox-model";
import { dispatchEmailNotification, enqueueBookingEmails } from "@/lib/email-outbox";

export const runtime = "nodejs";

const slots = ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"] as const;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function indiaToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function indiaMinutesNow() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  return Number(parts.find((part) => part.type === "hour")?.value) * 60 + Number(parts.find((part) => part.type === "minute")?.value);
}

function slotMinutes(value: string) {
  const match = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(value);
  if (!match) return -1;
  let hour = Number(match[1]) % 12;
  if (match[3] === "PM") hour += 12;
  return hour * 60 + Number(match[2]);
}

function databaseUnavailable(error: unknown) {
  const detail = error instanceof Error ? {
    name: error.name,
    message: error.message.replace(/mongodb(?:\+srv)?:\/\/[^\s"'<>]+/gi, "[MongoDB URI redacted]"),
    ...(typeof error === "object" && error !== null && "code" in error ? { code: error.code } : {}),
  } : { name: "UnknownError", message: "An unknown database operation failed." };
  console.error("Appointment database operation failed", detail);
  return NextResponse.json({ error: "Appointment service is temporarily unavailable. Please try again later." }, { status: 503 });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return NextResponse.json({ error: "Submit a valid appointment request." }, { status: 400 });
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Submit a valid JSON appointment request." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  const serviceName = typeof body.service === "string" ? body.service.trim() : "";
  const service = services.find((item) => item.name === serviceName);
  const phone = typeof body.phone === "string" ? body.phone.replace(/\D/g, "") : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const date = typeof body.date === "string" ? body.date : "";
  const time = typeof body.time === "string" ? body.time : "";
  const specialRequests = typeof body.specialRequests === "string" ? body.specialRequests.trim() : "";
  const errors: Record<string, string> = {};
  if (name.length < 2 || name.length > 100) errors.name = "Enter a name between 2 and 100 characters.";
  if (!/^[6-9]\d{9}$/.test(phone)) errors.phone = "Enter a valid 10-digit Indian mobile number.";
  if (email && (email.length > 254 || !emailPattern.test(email))) errors.email = "Enter a valid email address.";
  if (!service) errors.service = "Choose a valid service.";
  const parsedDate = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.valueOf()) || parsedDate.toISOString().slice(0, 10) !== date) errors.date = "Choose a valid appointment date.";
  else if (date < indiaToday()) errors.date = "Past appointment dates are not accepted.";
  if (!slots.includes(time as (typeof slots)[number])) errors.time = "Choose one of the listed appointment times.";
  else if (date === indiaToday() && slotMinutes(time) <= indiaMinutesNow()) errors.time = "Choose a later time for today.";
  if (specialRequests.length > 1000) errors.specialRequests = "Special requests must be 1,000 characters or fewer.";
  if (Object.keys(errors).length) return NextResponse.json({ error: "Please correct the highlighted fields.", fields: errors }, { status: 400 });
  if (!service) return NextResponse.json({ error: "Choose a valid service." }, { status: 400 });

  try {
    await connectToDatabase();
    await Appointment.init();
    await EmailOutbox.init();
    const session = await Appointment.db.startSession();
    let bookingReference = "";
    let notificationIds: string[] = [];
    let conflict = false;
    try {
      await session.withTransaction(async () => {
        conflict = false;
        bookingReference = "";
        notificationIds = [];
        const existing = await Appointment.exists({ date, time, status: { $in: ["pending", "confirmed"] } }).session(session);
        if (existing) { conflict = true; return; }
        const appointment = await new Appointment({ name, phone, email, service: service.name, date, time, price: null, specialRequests, status: "pending" }).save({ session });
        bookingReference = String(appointment._id);
        notificationIds = await enqueueBookingEmails(appointment, session);
      });
    } finally {
      await session.endSession();
    }
    if (conflict) return NextResponse.json({ error: "That time has already been requested. Please choose another time." }, { status: 409 });
    try {
      await Promise.all(notificationIds.map((id) => dispatchEmailNotification(id)));
    } catch (error) {
      console.error("Booking notification remains in the email outbox", error instanceof Error ? error.name : "unknown error");
    }
    return NextResponse.json({ message: "Appointment request received. The salon will confirm it manually.", bookingReference }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return NextResponse.json({ error: "That time has just been requested by someone else. Please choose another time." }, { status: 409 });
    }
    return databaseUnavailable(error);
  }
}

export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const status = url.searchParams.get("status");
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Use date=YYYY-MM-DD." }, { status: 400 });
  if (status && !["pending", "confirmed", "completed", "cancelled"].includes(status)) return NextResponse.json({ error: "Invalid appointment status." }, { status: 400 });
  try {
    await connectToDatabase();
    const appointments = await Appointment.find({ ...(date ? { date } : {}), ...(status ? { status } : {}) }).sort({ date: 1, time: 1 }).limit(500).lean();
    return NextResponse.json({ appointments });
  } catch (error) {
    return databaseUnavailable(error);
  }
}
