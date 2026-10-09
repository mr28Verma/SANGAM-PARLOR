import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { Appointment } from "@/lib/appointment-model";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

function todayInIndia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    await connectToDatabase();
    const today = todayInIndia();
    const [groups, todayCount, upcomingCount] = await Promise.all([
      Appointment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Appointment.countDocuments({ date: today, status: { $ne: "cancelled" } }),
      Appointment.countDocuments({ date: { $gt: today }, status: { $in: ["pending", "confirmed"] } }),
    ]);
    const counts: Record<string, number> = Object.fromEntries(groups.map((group: { _id: string; count: number }) => [group._id, group.count]));
    return NextResponse.json({
      metrics: {
        total: Object.values(counts).reduce((sum, count) => sum + count, 0),
        pending: counts.pending ?? 0,
        confirmed: counts.confirmed ?? 0,
        completed: counts.completed ?? 0,
        cancelled: counts.cancelled ?? 0,
        today: todayCount,
        upcoming: upcomingCount,
      },
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Admin dashboard query failed", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "Dashboard data is temporarily unavailable." }, { status: 503 });
  }
}
