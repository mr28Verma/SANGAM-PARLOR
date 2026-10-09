import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { Appointment } from "@/lib/appointment-model";
import { connectToDatabase } from "@/lib/mongodb";
import { EmailOutbox } from "@/lib/email-outbox-model";
import { dispatchEmailNotification, enqueueStatusEmail } from "@/lib/email-outbox";

export const runtime = "nodejs";
const transitions: Record<string, string[]> = {
  confirmed: ["pending"],
  cancelled: ["pending", "confirmed"],
  completed: ["confirmed"],
};

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { id } = await context.params;
  if (!/^[\da-f]{24}$/i.test(id)) return NextResponse.json({ error: "Invalid booking reference." }, { status: 400 });
  try {
    await connectToDatabase();
    const appointment = await Appointment.findById(id).lean();
    if (!appointment) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    return NextResponse.json({ appointment }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Admin booking detail query failed", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "Booking details are temporarily unavailable." }, { status: 503 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  const { id } = await context.params;
  if (!/^[\da-f]{24}$/i.test(id)) return NextResponse.json({ error: "Invalid booking reference." }, { status: 400 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Submit valid JSON." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body) || !("status" in body) || typeof body.status !== "string") {
    return NextResponse.json({ error: "Provide an allowed status." }, { status: 400 });
  }
  const nextStatus = body.status;
  const previousStatuses = transitions[nextStatus];
  if (!previousStatuses) return NextResponse.json({ error: "That status transition is not allowed." }, { status: 400 });
  try {
    await connectToDatabase();
    await EmailOutbox.init();
    const session = await Appointment.db.startSession();
    let appointmentResponse: unknown = null;
    let notificationId: string | null = null;
    try {
      await session.withTransaction(async () => {
        appointmentResponse = null;
        notificationId = null;
        const current = await Appointment.findById(id).session(session).lean();
        if (!current || !previousStatuses.includes(current.status)) return;
        const appointment = await Appointment.findOneAndUpdate(
          { _id: id, status: current.status },
          { $set: { status: nextStatus } },
          { returnDocument: "after", runValidators: true, session },
        ).lean();
        if (!appointment) return;
        appointmentResponse = appointment;
        notificationId = await enqueueStatusEmail(appointment, current.status, session);
      });
    } finally {
      await session.endSession();
    }
    if (appointmentResponse) {
      if (notificationId) {
        try { await dispatchEmailNotification(notificationId); }
        catch (error) { console.error("Status notification remains in the email outbox", error instanceof Error ? error.name : "unknown error"); }
      }
      return NextResponse.json({ appointment: appointmentResponse }, { headers: { "Cache-Control": "private, no-store" } });
    }
    const exists = await Appointment.exists({ _id: id });
    return NextResponse.json({ error: exists ? "This booking has already changed or cannot move to that status." : "Booking not found." }, { status: exists ? 409 : 404 });
  } catch (error) {
    console.error("Admin booking status update failed", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "Booking status could not be updated." }, { status: 503 });
  }
}
