import type { EmailEventPayload, EmailEventType } from "./email-outbox-model";

export type TransactionalEmail = { subject: string; html: string; text: string };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

function readableDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T00:00:00+05:30`));
}

function frame(title: string, body: string, detailRows: Array<[string, string]>) {
  const rows = detailRows.map(([label, value]) => `<tr><td style="padding:12px 0;color:#a39a8e;font-size:12px;border-bottom:1px solid #35322d">${escapeHtml(label)}</td><td style="padding:12px 0;color:#f4efe6;font-size:13px;text-align:right;border-bottom:1px solid #35322d">${escapeHtml(value)}</td></tr>`).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>${escapeHtml(title)}</title></head><body style="margin:0;padding:24px 12px;background:#111111;color:#f4efe6;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#1d1d1d;border:1px solid #35322d"><tr><td style="padding:26px 28px 18px;border-bottom:1px solid #35322d"><p style="margin:0;color:#c5a572;font-size:12px;font-weight:bold;letter-spacing:3px">SANGAM PARLOUR</p><p style="margin:7px 0 0;color:#a39a8e;font-size:11px;letter-spacing:1px">A THOUGHTFUL SALON EXPERIENCE</p></td></tr><tr><td style="padding:28px"><h1 style="margin:0 0 12px;color:#f4efe6;font-size:23px;line-height:1.3">${escapeHtml(title)}</h1><p style="margin:0 0 22px;color:#c9c1b6;font-size:14px;line-height:1.7">${body}</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">${rows}</table><p style="margin:23px 0 0;color:#a39a8e;font-size:12px;line-height:1.7">Sangam Parlour</p></td></tr></table></body></html>`;
}

export function buildTransactionalEmail(eventType: EmailEventType, booking: EmailEventPayload): TransactionalEmail {
  const name = escapeHtml(booking.name);
  const reference = `#${booking.bookingReference.slice(-8).toUpperCase()}`;
  const date = readableDate(booking.date);
  const details: Array<[string, string]> = [
    ["BOOKING REFERENCE", reference],
    ["SERVICE", booking.service],
    ["APPOINTMENT DATE", date],
    ["APPOINTMENT TIME", booking.time],
  ];

  if (eventType === "booking_received_customer") {
    return {
      subject: "We received your Sangam Parlour appointment request",
      html: frame("We’ve received your request", `<p style="margin:0 0 12px">Dear ${name},</p><p style="margin:0">Your appointment request has been received and is <strong style="color:#c5a572">pending confirmation</strong>. The salon will confirm your appointment separately.</p>`, [...details, ["STATUS", "Pending confirmation"]]),
      text: `Dear ${booking.name},\n\nWe received your Sangam Parlour appointment request. It is pending confirmation; the salon will confirm your appointment separately.\n\nBooking reference: ${reference}\nService: ${booking.service}\nAppointment date: ${date}\nAppointment time: ${booking.time}\nStatus: Pending confirmation\n\nSangam Parlour`,
    };
  }

  if (eventType === "booking_confirmed_customer") {
    return {
      subject: "Your Sangam Parlour appointment is confirmed",
      html: frame("Your appointment is confirmed", `<p style="margin:0 0 12px">Dear ${name},</p><p style="margin:0">Your appointment at Sangam Parlour is confirmed. We look forward to welcoming you.</p>`, [...details, ["STATUS", "Confirmed"]]),
      text: `Dear ${booking.name},\n\nYour Sangam Parlour appointment is confirmed. We look forward to welcoming you.\n\nBooking reference: ${reference}\nService: ${booking.service}\nAppointment date: ${date}\nAppointment time: ${booking.time}\n\nSangam Parlour`,
    };
  }

  if (eventType === "booking_cancelled_customer") {
    return {
      subject: "Update regarding your Sangam Parlour appointment",
      html: frame("An update to your appointment", `<p style="margin:0 0 12px">Dear ${name},</p><p style="margin:0">We’re sorry, but your appointment request has been cancelled. Please contact the salon if you have any questions.</p>`, [...details, ["STATUS", "Cancelled"]]),
      text: `Dear ${booking.name},\n\nWe’re sorry, but your appointment request has been cancelled. Please contact the salon if you have any questions.\n\nBooking reference: ${reference}\nService: ${booking.service}\nAppointment date: ${date}\nAppointment time: ${booking.time}\nStatus: Cancelled\n\nSangam Parlour`,
    };
  }

  return {
    subject: `New Sangam Parlour appointment request ${reference}`,
    html: frame("A new appointment request was received", `<p style="margin:0">A customer has submitted an appointment request. It is pending confirmation.</p>`, [...details, ["CUSTOMER", booking.name], ["EMAIL", booking.email || "Not provided"], ["PHONE", `+91 ${booking.phone}`], ["STATUS", "Pending confirmation"]]),
    text: `New Sangam Parlour appointment request\n\nCustomer: ${booking.name}\nEmail: ${booking.email || "Not provided"}\nPhone: +91 ${booking.phone}\nBooking reference: ${reference}\nService: ${booking.service}\nAppointment date: ${date}\nAppointment time: ${booking.time}\nStatus: Pending confirmation`,
  };
}
