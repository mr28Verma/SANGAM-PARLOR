import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { Appointment, appointmentServices } from "@/lib/appointment-model";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";
const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const search = (params.get("search") ?? "").trim().slice(0, 100);
  const date = params.get("date") ?? "";
  const status = params.get("status") ?? "";
  const service = params.get("service") ?? "";
  const page = Number(params.get("page") ?? "1");
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Use date=YYYY-MM-DD." }, { status: 400 });
  if (status && !allowedStatuses.includes(status)) return NextResponse.json({ error: "Choose a valid booking status." }, { status: 400 });
  const allowedServices = appointmentServices;
  if (service && !allowedServices.some((allowed) => allowed === service)) return NextResponse.json({ error: "Choose a valid appointment service." }, { status: 400 });
  if (!Number.isInteger(page) || page < 1 || page > 10000) return NextResponse.json({ error: "Invalid page number." }, { status: 400 });

  const filter: Record<string, unknown> = { ...(date ? { date } : {}), ...(status ? { status } : {}), ...(service ? { service } : {}) };
  if (search) {
    const safe = escapeRegex(search);
    const searchTerms: Record<string, unknown>[] = [
      { name: { $regex: safe, $options: "i" } },
      { phone: { $regex: safe } },
      { email: { $regex: safe, $options: "i" } },
    ];
    if (/^[\da-f]{24}$/i.test(search)) searchTerms.push({ _id: search });
    else if (/^[\da-f]{1,8}$/i.test(search)) searchTerms.push({ $expr: { $regexMatch: { input: { $toString: "$_id" }, regex: `${safe}$`, options: "i" } } });
    filter.$or = searchTerms;
  }

  try {
    await connectToDatabase();
    const pageSize = 15;
    const [appointments, total, statusCounts] = await Promise.all([
      Appointment.find(filter).sort({ date: 1, time: 1, createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
      Appointment.countDocuments(filter),
      Appointment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);
    const stats = { total: 0, pending: 0, confirmed: 0, cancelled: 0 };
    for (const item of statusCounts) {
      if (item._id in stats) stats[item._id as keyof typeof stats] = item.count;
      stats.total += item.count;
    }
    return NextResponse.json({ appointments, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)), stats, services: allowedServices }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Admin booking list query failed", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "Bookings are temporarily unavailable." }, { status: 503 });
  }
}
