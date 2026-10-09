"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BookingStatusActions({ bookingId, status }: { bookingId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function changeStatus(next: string) {
    if (next === "cancelled" && !window.confirm("Cancel this appointment?")) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/appointments/${bookingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Status could not be updated.");
      setNotice("Appointment status updated.");
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Status could not be updated."); }
    finally { setBusy(false); }
  }

  const actions = status === "pending" ? [{ label: "Confirm appointment", value: "confirmed" }, { label: "Cancel appointment", value: "cancelled" }] : status === "confirmed" ? [{ label: "Mark completed", value: "completed" }, { label: "Cancel appointment", value: "cancelled" }] : [];
  return <section className="admin-status-actions-panel"><div><p className="admin-eyebrow">BOOKING MANAGEMENT</p><h2>Update this request</h2><p>Allowed status changes depend on the current booking state.</p></div><div className="admin-status-action-buttons">{actions.map((action) => <button className={action.value === "cancelled" ? "secondary" : ""} key={action.value} type="button" disabled={busy} onClick={() => void changeStatus(action.value)}>{busy ? "Saving…" : action.label}</button>)}{actions.length === 0 && <span className="admin-final-status-note">This booking is closed.</span>}</div>{error && <p className="admin-alert" role="alert">{error}</p>}{notice && <p className="admin-success" role="status">{notice}</p>}</section>;
}
