"use client";

import Link from "next/link";
import { CalendarDays, Check, Clipboard, Clock3, FilterX, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Booking = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  service: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  specialRequests?: string;
  price?: number | null;
};
type ListResponse = { appointments?: Booking[]; total?: number; pages?: number; services?: string[]; error?: string };

function displayDate(value: string, weekday = false) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", ...(weekday ? { weekday: "short" as const } : {}), day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00+05:30`));
}
function displayCreated(value: string) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}
function displayToday() {
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
}
function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function BookingsTable() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [service, setService] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Booking[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [copiedId, setCopiedId] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const loadBookings = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (date) params.set("date", date);
      if (status) params.set("status", status);
      if (service) params.set("service", service);
      const response = await fetch(`/api/admin/appointments?${params}`, { cache: "no-store" });
      const result: ListResponse = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not load appointments.");
      setRows(result.appointments ?? []);
      setServices(result.services ?? []);
      setTotal(result.total ?? 0);
      setPages(result.pages ?? 1);
      setError("");
    } catch (cause) {
      setRows([]);
      setError(cause instanceof Error ? cause.message : "Could not load appointments.");
    } finally {
      setLoading(false);
    }
  }, [date, page, search, service, status]);

  // The callback settles after its request and updates the list and loading state.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setLoading(true); void loadBookings(); }, [loadBookings]);

  useEffect(() => {
    const refresh = () => { setLoading(true); setError(""); void loadBookings(); };
    window.addEventListener("admin:refresh", refresh);
    return () => window.removeEventListener("admin:refresh", refresh);
  }, [loadBookings]);

  useEffect(() => {
    if (!selected) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>(".admin-dialog-close")?.focus();
    function handleDialogKeys(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); setSelected(null); return; }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", handleDialogKeys);
    return () => { document.removeEventListener("keydown", handleDialogKeys); previous?.focus(); };
  }, [selected]);

  async function updateStatus(booking: Booking, nextStatus: "confirmed" | "completed" | "cancelled") {
    if (nextStatus === "cancelled" && !window.confirm(`Cancel the appointment for ${booking.name}?`)) return;
    setUpdatingId(booking._id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/appointments/${booking._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Status could not be updated.");
      setNotice("Appointment status updated.");
      if (selected?._id === booking._id) setSelected({ ...selected, status: nextStatus });
      await loadBookings();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Status could not be updated.");
    } finally {
      setUpdatingId("");
    }
  }

  function clearFilters() { setSearchInput(""); setSearch(""); setDate(""); setStatus(""); setService(""); setPage(1); }
  async function copyReference(id: string) {
    try { await navigator.clipboard.writeText(id); setCopiedId(id); window.setTimeout(() => setCopiedId(""), 1400); }
    catch { setNotice("Copy is unavailable in this browser."); }
  }
  const hasFilters = Boolean(searchInput || date || status || service);

  return (
    <div className="admin-page admin-appointments-page" data-reveal>
      <div className="admin-breadcrumb"><Link href="/admin">Admin</Link><span aria-hidden="true">/</span><span>Appointments</span></div>
      <div className="admin-page-heading admin-appointments-heading">
        <div><p className="admin-eyebrow">SANGAM PARLOUR <span aria-hidden="true">/</span> CLIENT CARE</p><h1>Appointment <em>Management</em></h1><p>Manage reservations, confirm visits, and care for every client.</p></div>
        <div className="admin-heading-tools"><span className="admin-today"><CalendarDays size={15} aria-hidden="true" />{displayToday()}</span><button className="admin-refresh-button" type="button" onClick={() => { setLoading(true); setError(""); void loadBookings(); }} disabled={loading}><span className={loading ? "admin-spin" : ""}><Clock3 size={15} aria-hidden="true" /></span> Refresh</button></div>
      </div>

      <section className="admin-panel admin-bookings-panel" aria-labelledby="appointments-title">
        <div className="admin-panel-heading admin-appointments-panel-heading"><div><p className="admin-eyebrow">THE APPOINTMENT BOOK</p><h2 id="appointments-title">Reservations</h2></div><span className="admin-results-count">{loading ? "Updating…" : `${total} ${total === 1 ? "result" : "results"}`}</span></div>
        <div className="admin-booking-toolbar">
          <label className="admin-search-field"><Search size={16} aria-hidden="true"/><span className="sr-only">Search by customer name, phone, email or reference</span><input type="search" placeholder="Name, phone, email or reference" value={searchInput} onChange={(event) => { setSearchInput(event.target.value); setLoading(true); }} /></label>
          <label className="admin-filter-field"><span className="sr-only">Filter by appointment date</span><input type="date" value={date} onChange={(event) => { setDate(event.target.value); setPage(1); setLoading(true); }} /></label>
          <label className="admin-filter-field"><span className="sr-only">Filter by status</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); setLoading(true); }}><option value="">All statuses</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label>
          <label className="admin-filter-field"><span className="sr-only">Filter by service</span><select value={service} onChange={(event) => { setService(event.target.value); setPage(1); setLoading(true); }}><option value="">All services</option>{services.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          {hasFilters && <button className="admin-clear-filters" type="button" onClick={clearFilters}><FilterX size={14} aria-hidden="true"/> Clear filters</button>}
        </div>
        {error && <div className="admin-alert admin-booking-error" role="alert"><span>{error}</span><button type="button" onClick={() => { setLoading(true); void loadBookings(); }}>Retry</button></div>}
        {notice && <p className="admin-success" role="status">{notice}</p>}
        <div className="admin-table-scroll"><table className="admin-bookings-table"><thead><tr><th>BOOKING REFERENCE</th><th>CUSTOMER</th><th>SERVICE</th><th>APPOINTMENT</th><th>STATUS</th><th>REQUESTED</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
          {loading && rows.length === 0 ? Array.from({ length: 5 }, (_, index) => <tr key={`skeleton-${index}`}><td colSpan={7}><span className="admin-booking-skeleton" /></td></tr>) : rows.length === 0 ? <tr><td colSpan={7} className="admin-table-message">{error ? "Appointments could not be loaded." : "No appointments match these filters."}{hasFilters && <button className="admin-inline-clear" type="button" onClick={clearFilters}>Clear filters</button>}</td></tr> : rows.map((booking) => <tr key={booking._id}>
            <td><span className="admin-reference">#{booking._id.slice(-8).toUpperCase()}</span><button className="admin-copy-reference" type="button" aria-label="Copy full booking reference" onClick={() => void copyReference(booking._id)}>{copiedId === booking._id ? <Check size={13} /> : <Clipboard size={13} />}</button></td>
            <td><span className="admin-customer-cell"><span className="admin-customer-avatar" aria-hidden="true">{initials(booking.name)}</span><span><strong className="admin-customer-name">{booking.name}</strong><span className="admin-cell-subline">{booking.phone}</span>{booking.email && <span className="admin-cell-subline">{booking.email}</span>}</span></span></td>
            <td>{booking.service}</td><td><strong className="admin-appointment-date">{displayDate(booking.date)}</strong><span className="admin-cell-subline">{booking.time}</span></td>
            <td><span className={`admin-status ${booking.status}`}>{booking.status}</span></td><td>{displayCreated(booking.createdAt)}</td>
            <td><div className="admin-row-actions"><button className="admin-detail-link" type="button" onClick={() => setSelected(booking)}>Details</button>{booking.status === "pending" && <button type="button" disabled={updatingId === booking._id} onClick={() => void updateStatus(booking, "confirmed")}>{updatingId === booking._id ? "Saving…" : "Confirm"}</button>}{(booking.status === "pending" || booking.status === "confirmed") && <button className="cancel" type="button" disabled={updatingId === booking._id} onClick={() => void updateStatus(booking, "cancelled")}>Cancel</button>}</div></td>
          </tr>)}
        </tbody></table></div>
        <div className="admin-mobile-booking-list" aria-live="polite">
          {loading && rows.length === 0 ? Array.from({ length: 3 }, (_, index) => <div className="admin-mobile-booking-skeleton" key={index} />) : rows.length === 0 ? <div className="admin-table-message">{error ? "Appointments could not be loaded." : "No appointments match these filters."}{hasFilters && <button className="admin-inline-clear" type="button" onClick={clearFilters}>Clear filters</button>}</div> : rows.map((booking) => <article className="admin-mobile-booking-card" key={booking._id}><div className="admin-mobile-booking-top"><span className="admin-customer-avatar" aria-hidden="true">{initials(booking.name)}</span><div><strong>{booking.name}</strong><span>{booking.phone}{booking.email ? ` · ${booking.email}` : ""}</span></div><span className={`admin-status ${booking.status}`}>{booking.status}</span></div><div className="admin-mobile-booking-info"><span>{booking.service}</span><strong>{displayDate(booking.date)} · {booking.time}</strong><small>Requested {displayCreated(booking.createdAt)}</small></div><div className="admin-mobile-booking-actions"><button type="button" onClick={() => setSelected(booking)}>Details</button>{booking.status === "pending" && <button type="button" disabled={updatingId === booking._id} onClick={() => void updateStatus(booking, "confirmed")}>Confirm</button>}{(booking.status === "pending" || booking.status === "confirmed") && <button className="cancel" type="button" disabled={updatingId === booking._id} onClick={() => void updateStatus(booking, "cancelled")}>Cancel</button>}</div></article>)}
        </div>
        <div className="admin-table-footer"><span>{loading ? "Updating list…" : `${total} ${total === 1 ? "appointment" : "appointments"}`}</span><div><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page} of {pages}</span><button type="button" disabled={page >= pages || loading} onClick={() => setPage((value) => value + 1)}>Next</button></div></div>
      </section>

      {selected && <div className="admin-booking-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><div className="admin-booking-dialog" role="dialog" aria-modal="true" aria-labelledby="booking-dialog-title" aria-describedby="booking-dialog-description" tabIndex={-1} ref={dialogRef}><div className="admin-booking-dialog-head"><div><p className="admin-eyebrow">BOOKING REFERENCE / {selected._id.slice(-8).toUpperCase()}</p><h2 id="booking-dialog-title">Appointment details</h2><p id="booking-dialog-description">Client and reservation information.</p></div><button type="button" className="admin-dialog-close" aria-label="Close appointment details" onClick={() => setSelected(null)}><X size={18} /></button></div><dl className="admin-booking-dialog-details"><div><dt>CLIENT</dt><dd>{selected.name}</dd></div><div><dt>PHONE</dt><dd><a href={`tel:+91${selected.phone}`}>+91 {selected.phone}</a></dd></div><div><dt>EMAIL</dt><dd>{selected.email ? <a href={`mailto:${selected.email}`}>{selected.email}</a> : "Not provided"}</dd></div><div><dt>SERVICE</dt><dd>{selected.service}{selected.price != null ? ` · ₹${selected.price}` : ""}</dd></div><div><dt>APPOINTMENT</dt><dd>{displayDate(selected.date, true)} · {selected.time}</dd></div><div><dt>STATUS</dt><dd><span className={`admin-status ${selected.status}`}>{selected.status}</span></dd></div><div><dt>REQUEST RECEIVED</dt><dd>{displayCreated(selected.createdAt)}</dd></div><div><dt>SPECIAL REQUESTS</dt><dd>{selected.specialRequests || "None"}</dd></div></dl><div className="admin-dialog-actions"><Link href={`/admin/bookings/${selected._id}`}>Full details</Link>{selected.status === "pending" && <button type="button" disabled={updatingId === selected._id} onClick={() => void updateStatus(selected, "confirmed")}>Confirm</button>}{(selected.status === "pending" || selected.status === "confirmed") && <button className="cancel" type="button" disabled={updatingId === selected._id} onClick={() => void updateStatus(selected, "cancelled")}>Cancel appointment</button>}</div></div></div>}
    </div>
  );
}
