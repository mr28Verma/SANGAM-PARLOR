import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Appointment } from "@/lib/appointment-model";
import { connectToDatabase } from "@/lib/mongodb";
import { BookingStatusActions } from "./status-actions";

type RouteParams = { params: Promise<{ id: string }> };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T00:00:00+05:30`));
}

function formatTimestamp(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }).format(value);
}

export default async function BookingDetailPage({ params }: RouteParams) {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/admin/login");
  const { id } = await params;
  if (!/^[\da-f]{24}$/i.test(id)) notFound();
  await connectToDatabase();
  const booking = await Appointment.findById(id).lean();
  if (!booking) notFound();

  return (
    <div className="admin-page" data-reveal>
      <div className="admin-page-heading admin-detail-heading"><div><Link className="admin-back-link" href="/admin/bookings">← All appointments</Link><p className="admin-eyebrow">BOOKING REFERENCE / {String(booking._id).slice(-8).toUpperCase()}</p><h1>{booking.name}</h1><p>Appointment request details and status.</p></div><span className={`admin-status ${booking.status}`}>{booking.status}</span></div>
      <div className="admin-detail-grid">
        <section className="admin-panel admin-detail-panel"><p className="admin-eyebrow">APPOINTMENT</p><h2>Your visit</h2><dl className="admin-detail-list"><div><dt>SERVICE</dt><dd>{booking.service}</dd></div><div><dt>DATE</dt><dd>{formatDate(booking.date)}</dd></div><div><dt>TIME</dt><dd>{booking.time}</dd></div><div><dt>STATUS</dt><dd><span className={`admin-status ${booking.status}`}>{booking.status}</span></dd></div><div><dt>BOOKING REFERENCE</dt><dd>{String(booking._id)}</dd></div><div><dt>REQUEST RECEIVED</dt><dd>{formatTimestamp(booking.createdAt)}</dd></div></dl></section>
        <section className="admin-panel admin-detail-panel"><p className="admin-eyebrow">CUSTOMER</p><h2>Contact details</h2><dl className="admin-detail-list"><div><dt>FULL NAME</dt><dd>{booking.name}</dd></div><div><dt>PHONE</dt><dd><a href={`tel:+91${booking.phone}`}>+91 {booking.phone}</a></dd></div><div><dt>EMAIL</dt><dd>{booking.email ? <a href={`mailto:${booking.email}`}>{booking.email}</a> : "Not provided"}</dd></div><div><dt>SPECIAL REQUESTS</dt><dd>{booking.specialRequests || "None"}</dd></div></dl></section>
      </div>
      <BookingStatusActions bookingId={String(booking._id)} status={booking.status} />
    </div>
  );
}
