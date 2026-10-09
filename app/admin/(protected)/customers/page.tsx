import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UsersRound } from "lucide-react";
import { auth } from "@/auth";
import { Appointment } from "@/lib/appointment-model";
import { connectToDatabase } from "@/lib/mongodb";
import { CustomerDirectory, type CustomerRecord } from "./customer-directory";

export const metadata: Metadata = { title: "Customers | Sangam Parlour Admin", robots: { index: false, follow: false } };

export default async function AdminCustomersPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/admin/login");

  let customers: CustomerRecord[] = [];
  let unavailable = false;
  try {
    await connectToDatabase();
    const records = await Appointment.aggregate([
      { $sort: { createdAt: -1 } },
      { $group: {
        _id: { $cond: [{ $ne: [{ $ifNull: ["$email", ""] }, ""] }, { $concat: ["email:", { $toLower: "$email" }] }, { $concat: ["phone:", "$phone"] }] },
        name: { $first: "$name" }, phone: { $first: "$phone" }, email: { $first: "$email" },
        appointments: { $sum: 1 }, lastVisit: { $max: "$date" },
      } },
      { $sort: { name: 1 } },
    ]);
    customers = records.map((customer) => ({ name: customer.name, phone: customer.phone, email: customer.email || "", appointments: customer.appointments, lastVisit: customer.lastVisit }));
  } catch (error) {
    console.error("Admin customer directory query failed", error instanceof Error ? error.name : "unknown error");
    unavailable = true;
  }

  return <div className="admin-page admin-customer-page" data-reveal>
    <div className="admin-page-heading admin-customer-heading"><div><p className="admin-eyebrow">SANGAM PARLOUR / CLIENTS</p><h1>Customer <em>directory.</em></h1><p>Clients are grouped from the contact details on their appointment records.</p></div><span className="admin-customer-total"><UsersRound size={17} aria-hidden="true" />{unavailable ? "—" : customers.length} clients</span></div>
    {unavailable && <p className="admin-alert" role="alert">Customer records are temporarily unavailable. Check the database connection and refresh.</p>}
    {unavailable ? <div className="admin-panel admin-customer-empty">Customer records could not be loaded.</div> : <CustomerDirectory customers={customers} />}
  </div>;
}
