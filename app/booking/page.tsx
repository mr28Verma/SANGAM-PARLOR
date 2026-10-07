import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Appointments | Sangam Parlour",
  description: "Appointment booking for Sangam Parlour.",
};

export default function BookingPage() {
  return (
    <main className="booking-placeholder">
      <div className="booking-topbar"><Link href="/#home" className="brand-lockup"><span>SANGAM</span><small>PARLOUR</small></Link><ThemeToggle /></div>
      <div className="booking-placeholder-copy">
        <p className="eyebrow">APPOINTMENTS AT SANGAM</p>
        <h1>Let’s plan<br/><em>your visit.</em></h1>
        <p>Online appointment booking is not available yet. Verified contact options will be published here as soon as they’re confirmed.</p>
        <div className="booking-placeholder-actions">
          <Link className="button button-dark" href="/#contact">VIEW CONTACT DETAILS <ArrowRight size={15}/></Link>
          <Link className="underlined-link" href="/"><ArrowLeft size={15}/> BACK TO SANGAM</Link>
        </div>
      </div>
    </main>
  );
}
