import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { AppointmentBooking } from "./appointment-booking";

export const metadata: Metadata = {
  title: "Book an Appointment | Sangam Parlour",
  description: "Request an appointment with Sangam Parlour.",
};

export default function BookingPage() {
  return (
    <div className="site-page booking-site-page">
      <header className="booking-header section-wrap">
        <div className="booking-header-inner">
          <Link className="brand-lockup booking-header-brand" href="/" aria-label="Sangam Parlour home">
            <span>SANGAM</span><small>PARLOUR</small>
          </Link>
          <p className="booking-header-label">YOUR BEAUTY EXPERIENCE</p>
          <Link className="booking-header-home" href="/"><ArrowLeft size={15} aria-hidden="true"/><span>Back to Home</span></Link>
        </div>
      </header>
      <main className="booking-page section-wrap">
        <AppointmentBooking />
      </main>
      <SiteFooter homeLinks />
    </div>
  );
}
