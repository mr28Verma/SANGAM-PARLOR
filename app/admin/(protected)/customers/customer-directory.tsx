"use client";

import { useMemo, useState } from "react";
import { Mail, Phone, Search, UsersRound } from "lucide-react";

export type CustomerRecord = { name: string; phone: string; email: string; appointments: number; lastVisit: string };

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("");
}

function formatDate(value: string) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00+05:30`));
}

export function CustomerDirectory({ customers }: { customers: CustomerRecord[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const value = query.trim().toLocaleLowerCase();
    if (!value) return customers;
    return customers.filter((customer) => `${customer.name} ${customer.phone} ${customer.email}`.toLocaleLowerCase().includes(value));
  }, [customers, query]);

  return <section className="admin-panel admin-customer-directory" aria-label="Customer directory">
    <div className="admin-customer-toolbar"><label className="admin-search-field"><Search size={17} aria-hidden="true" /><span className="sr-only">Search customers by name, email, or phone</span><input type="search" placeholder="Search name, email, or phone" value={query} onChange={(event) => setQuery(event.target.value)} /></label><span>{filtered.length} {filtered.length === 1 ? "client" : "clients"}</span></div>
    {filtered.length === 0 ? <div className="admin-overview-empty"><UsersRound size={22} aria-hidden="true" /><strong>{customers.length ? "No clients match your search" : "No client records yet"}</strong><span>{customers.length ? "Try another name, email, or phone number." : "Clients appear here after an appointment is requested."}</span></div> : <div className="admin-customer-grid">{filtered.map((customer) => <article className="admin-customer-card" key={`${customer.email || customer.phone}`}>
      <div className="admin-customer-card-heading"><span className="admin-customer-large-avatar" aria-hidden="true">{initials(customer.name)}</span><span><strong>{customer.name}</strong><small>{customer.appointments} {customer.appointments === 1 ? "appointment" : "appointments"}</small></span></div>
      <div className="admin-customer-contact">{customer.phone && <a href={`tel:+91${customer.phone}`}><Phone size={15} aria-hidden="true" />+91 {customer.phone}</a>}{customer.email && <a href={`mailto:${customer.email}`}><Mail size={15} aria-hidden="true" />{customer.email}</a>}</div>
      <div className="admin-customer-last-visit"><span>LAST APPOINTMENT</span><strong>{formatDate(customer.lastVisit)}</strong></div>
    </article>)}</div>}
  </section>;
}
