"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, UsersRound } from "lucide-react";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Appointments", icon: CalendarDays },
  { href: "/admin/customers", label: "Customers", icon: UsersRound },
];

export function AdminNavigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return <nav className={mobile ? "admin-nav admin-nav-mobile" : "admin-nav"} aria-label={mobile ? "Mobile admin navigation" : "Admin navigation"}>
    {items.map(({ href, label, icon: Icon }) => {
      const active = href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
      return <Link key={href} href={href} aria-current={active ? "page" : undefined} onClick={() => { if (mobile) { const menu = document.querySelector<HTMLDetailsElement>(".admin-mobile-menu"); if (menu) menu.open = false; } }}>
        <Icon size={18} strokeWidth={1.7} aria-hidden="true" /><span>{label}</span>
      </Link>;
    })}
  </nav>;
}
