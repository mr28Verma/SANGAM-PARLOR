"use client";

import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, Menu, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { logoutAction } from "@/app/admin/actions";
import { AdminNavigation } from "./admin-navigation";

const titles: Record<string, string> = {
  "/admin": "Dashboard Overview",
  "/admin/bookings": "Appointment Management",
  "/admin/customers": "Customer Directory",
};

function todayInIndia() {
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", month: "short", day: "2-digit", year: "numeric" }).format(new Date());
}

export function AdminTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const title = titles[pathname] ?? (pathname.startsWith("/admin/bookings/") ? "Appointment Details" : "Sangam Parlour Admin");

  function refresh() {
    setRefreshing(true);
    window.dispatchEvent(new Event("admin:refresh"));
    router.refresh();
    window.setTimeout(() => setRefreshing(false), 650);
  }

  return <header className="admin-topbar">
    <div className="admin-topbar-title"><h2>{title}</h2><p>Sangam Parlour Luxury Salon Workspace</p></div>
    <details className="admin-mobile-menu" onKeyDown={(event) => { if (event.key === "Escape") event.currentTarget.open = false; }}><summary aria-label="Open admin navigation"><Menu size={19} aria-hidden="true" /></summary><div className="admin-mobile-drawer"><div className="admin-mobile-drawer-brand"><span className="admin-brand-mark">S</span><span><strong>SANGAM</strong><small>PARLOUR</small></span><button type="button" aria-label="Close admin navigation" onClick={() => { const menu = document.querySelector<HTMLDetailsElement>(".admin-mobile-menu"); if (menu) menu.open = false; }}><X size={18} aria-hidden="true" /></button></div><AdminNavigation mobile /><form action={logoutAction}><button type="submit">Sign out</button></form></div></details>
    <div className="admin-topbar-tools"><button className="admin-topbar-refresh" type="button" onClick={refresh} aria-label="Refresh dashboard data"><RefreshCw size={16} className={refreshing ? "admin-spin" : ""} aria-hidden="true" /></button><span className="admin-date-chip"><CalendarDays size={14} aria-hidden="true" />{todayInIndia()}</span><span className="admin-account"><i aria-hidden="true" />Owner Access</span></div>
  </header>;
}
