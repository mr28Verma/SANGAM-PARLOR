import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Check, Clock3, UsersRound, ArrowUpRight, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { Appointment } from "@/lib/appointment-model";
import { connectToDatabase } from "@/lib/mongodb";

export const metadata: Metadata = { title: "Overview | Sangam Parlour Admin", robots: { index: false, follow: false } };

function todayInIndia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short" }).format(new Date(`${value}T00:00:00+05:30`));
}

function formatRequested(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(value);
}

export default async function AdminDashboardPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/admin/login");

  const today = todayInIndia();
  let metrics = { total: 0, pending: 0, confirmed: 0, customers: 0, today: 0 };
  let upcoming: Array<{ id: string; name: string; service: string; date: string; time: string; status: string }> = [];
  let recent: Array<{ id: string; name: string; service: string; date: string; time: string; status: string; createdAt: Date }> = [];
  let unavailable = false;

  try {
    await connectToDatabase();
    const [groups, todayCount, customerGroups, nextBookings, recentBookings] = await Promise.all([
      Appointment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Appointment.countDocuments({ date: today, status: { $ne: "cancelled" } }),
      Appointment.aggregate([
        { $group: { _id: { $cond: [{ $ne: [{ $ifNull: ["$email", ""] }, ""] }, { $concat: ["email:", { $toLower: "$email" }] }, { $concat: ["phone:", "$phone"] }] } } },
        { $count: "total" },
      ]),
      Appointment.find({ date: { $gte: today }, status: { $in: ["pending", "confirmed"] } }).sort({ date: 1, time: 1 }).limit(4).lean(),
      Appointment.find().sort({ createdAt: -1 }).limit(4).lean(),
    ]);
    const counts = Object.fromEntries(groups.map((group: { _id: string; count: number }) => [group._id, group.count]));
    metrics = {
      total: Object.values(counts).reduce((sum: number, count) => sum + Number(count), 0),
      pending: Number(counts.pending ?? 0),
      confirmed: Number(counts.confirmed ?? 0),
      customers: Number(customerGroups[0]?.total ?? 0),
      today: todayCount,
    };
    upcoming = nextBookings.map((booking) => ({ id: String(booking._id), name: booking.name, service: booking.service, date: booking.date, time: booking.time, status: booking.status }));
    recent = recentBookings.map((booking) => ({ id: String(booking._id), name: booking.name, service: booking.service, date: booking.date, time: booking.time, status: booking.status, createdAt: booking.createdAt }));
  } catch (error) {
    console.error("Admin overview query failed", error instanceof Error ? error.name : "unknown error");
    unavailable = true;
  }

  const cards = [
    { label: "TODAY’S APPOINTMENTS", value: metrics.today, detail: "Active appointments today", icon: CalendarDays },
    { label: "PENDING REQUESTS", value: metrics.pending, detail: "Waiting for confirmation", icon: Clock3 },
    { label: "CONFIRMED BOOKINGS", value: metrics.confirmed, detail: "Ready for their visit", icon: Check },
    { label: "TOTAL CLIENTS", value: metrics.customers, detail: "Distinct email or phone", icon: UsersRound },
  ];

  return (
    <div className="admin-page admin-overview-page" data-reveal>
      <section className="admin-welcome-banner" aria-labelledby="overview-welcome">
        <div className="admin-welcome-copy">
          <span className="admin-welcome-kicker"><Sparkles size={14} aria-hidden="true" /> Salon command center</span>
          <h1 id="overview-welcome">Welcome back to <em>Sangam Parlour.</em></h1>
          <p>{unavailable ? "Your appointment overview is temporarily unavailable." : <>Here is today’s schedule and salon overview. <strong>{metrics.pending} pending {metrics.pending === 1 ? "request" : "requests"}</strong> waiting for review.</>}</p>
        </div>
        <div className="admin-welcome-actions">
          <Link className="admin-welcome-primary" href="/admin/bookings"><CalendarDays size={16} aria-hidden="true" /> Manage appointments</Link>
          <Link className="admin-welcome-secondary" href="/admin/customers"><UsersRound size={16} aria-hidden="true" /> View customers</Link>
        </div>
      </section>

      {unavailable && <p className="admin-alert" role="alert">Dashboard data is temporarily unavailable. Check the database connection and refresh.</p>}

      <section className="admin-overview-metrics" aria-label="Appointment and customer statistics">
        {cards.map(({ label, value, detail, icon: Icon }) => <article className="admin-overview-card" key={label}>
          <div className="admin-overview-card-top"><p>{label}</p><span><Icon size={17} strokeWidth={1.8} aria-hidden="true" /></span></div>
          <strong>{unavailable ? "—" : value}</strong>
          <small>{unavailable ? "Unavailable" : detail}</small>
        </article>)}
      </section>

      <section className="admin-overview-grid" aria-label="Appointments and recent requests">
        <div className="admin-panel admin-overview-list-panel">
          <div className="admin-overview-panel-heading"><div><p className="admin-eyebrow">NEXT ON THE CALENDAR</p><h2>Upcoming appointments</h2><span>Confirmed and pending visits</span></div><Link href="/admin/bookings">View all <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
          {unavailable ? <div className="admin-overview-empty" role="status">Appointments could not be loaded.</div> : upcoming.length === 0 ? <div className="admin-overview-empty"><CalendarDays size={21} aria-hidden="true" /><strong>No upcoming appointments</strong><span>New confirmed and pending visits will appear here.</span></div> : <div className="admin-overview-bookings">{upcoming.map((booking) => <Link className="admin-overview-booking" href={`/admin/bookings/${booking.id}`} key={booking.id}>
            <span className="admin-overview-booking-date"><strong>{formatDate(booking.date)}</strong><small>{booking.time}</small></span>
            <span className="admin-overview-booking-client"><strong>{booking.name}</strong><small>{booking.service}</small></span>
            <span className={`admin-status ${booking.status}`}>{booking.status}</span><ArrowUpRight className="admin-overview-arrow" size={15} aria-hidden="true" />
          </Link>)}</div>}
        </div>

        <div className="admin-panel admin-recent-panel">
          <div className="admin-overview-panel-heading"><div><p className="admin-eyebrow">LATEST REQUESTS</p><h2>Recently received</h2><span>Latest appointment records</span></div><span className="admin-live-indicator"><i aria-hidden="true" /> Live</span></div>
          {unavailable ? <div className="admin-overview-empty" role="status">Recent appointments could not be loaded.</div> : recent.length === 0 ? <div className="admin-overview-empty"><Clock3 size={21} aria-hidden="true" /><strong>No appointment requests yet</strong><span>New requests will appear here.</span></div> : <div className="admin-recent-list">{recent.map((booking) => <Link className="admin-recent-item" href={`/admin/bookings/${booking.id}`} key={booking.id}>
            <span className={`admin-recent-mark ${booking.status}`} aria-hidden="true"><CalendarDays size={14} /></span><span className="admin-recent-copy"><strong>{booking.name}</strong><small>{booking.service} · {formatDate(booking.date)} at {booking.time}</small><small>Received {formatRequested(booking.createdAt)}</small></span><span className={`admin-status ${booking.status}`}>{booking.status}</span>
          </Link>)}</div>}
        </div>
      </section>
      <p className="admin-data-note">Statistics and appointment records come from MongoDB. Dates use India Standard Time.</p>
    </div>
  );
}
