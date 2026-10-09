import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BookingsTable } from "./bookings-table";

export const metadata: Metadata = { title: "Appointments | Sangam Parlour Admin", robots: { index: false, follow: false } };

export default async function AdminBookingsPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/admin/login");
  return <BookingsTable />;
}
