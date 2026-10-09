import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { resolve } from "node:path";
import ts from "typescript";

async function loadTypeScript(relativePath) {
  const source = await readFile(resolve(process.cwd(), relativePath), "utf8");
  const compiled = ts.transpile(source, { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 });
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
}

const booking = {
  name: "Aarav Sharma",
  email: "aarav@example.test",
  phone: "9876543210",
  service: "Hair",
  date: "2030-02-03",
  time: "10:00 AM",
  bookingReference: "65a0b123456789abcdef0123",
};

test("request email says pending and never implies confirmation", async () => {
  const { buildTransactionalEmail } = await loadTypeScript("lib/email-templates.ts");
  const message = buildTransactionalEmail("booking_received_customer", booking);
  assert.equal(message.subject, "We received your Sangam Parlour appointment request");
  assert.match(message.text, /Pending confirmation/);
  assert.match(message.text, /confirm your appointment separately/);
  assert.doesNotMatch(message.text, /appointment is confirmed/i);
  assert.match(message.html, /#CDEF0123/);
});

test("admin notification includes the real booking contact and schedule fields", async () => {
  const { buildTransactionalEmail } = await loadTypeScript("lib/email-templates.ts");
  const message = buildTransactionalEmail("booking_created_admin", booking);
  for (const value of [booking.name, booking.email, booking.phone, booking.service, "Sunday, 3 February 2030", booking.time]) assert.ok(message.text.includes(value));
  assert.ok(message.html.includes("SANGAM PARLOUR"));
});

test("confirmation and cancellation use their required subjects and plain-text bodies", async () => {
  const { buildTransactionalEmail } = await loadTypeScript("lib/email-templates.ts");
  const confirmed = buildTransactionalEmail("booking_confirmed_customer", booking);
  const cancelled = buildTransactionalEmail("booking_cancelled_customer", booking);
  assert.equal(confirmed.subject, "Your Sangam Parlour appointment is confirmed");
  assert.match(confirmed.text, /appointment is confirmed/i);
  assert.equal(cancelled.subject, "Update regarding your Sangam Parlour appointment");
  assert.match(cancelled.text, /has been cancelled/i);
  assert.ok(confirmed.text.length > 0 && cancelled.text.length > 0);
});

test("customer-controlled fields are escaped in the HTML template", async () => {
  const { buildTransactionalEmail } = await loadTypeScript("lib/email-templates.ts");
  const message = buildTransactionalEmail("booking_received_customer", { ...booking, name: "<script>alert(1)</script>" });
  assert.doesNotMatch(message.html, /<script>/i);
  assert.match(message.html, /&lt;script&gt;/i);
});

test("Brevo request uses configured sender and idempotency key with a mocked provider", async () => {
  const { sendTransactionalEmailWithBrevo } = await loadTypeScript("lib/brevo-client.ts");
  let captured;
  const result = await sendTransactionalEmailWithBrevo(
    { apiKey: "test-only-key", senderEmail: "sender@example.test", senderName: "Sangam Parlour" },
    { recipientEmail: booking.email, recipientName: booking.name, idempotencyKey: "d97bfe79-25f2-4669-b3a0-b3c38704e0b7", content: { subject: "subject", html: "<p>html</p>", text: "plain" } },
    async (url, options) => {
      captured = { url, options, body: JSON.parse(options.body) };
      return new Response(JSON.stringify({ messageId: "mock-message-id" }), { status: 201, headers: { "content-type": "application/json" } });
    },
  );
  assert.equal(result.messageId, "mock-message-id");
  assert.equal(captured.url, "https://api.brevo.com/v3/smtp/email");
  assert.equal(captured.options.headers["api-key"], "test-only-key");
  assert.equal(captured.body.sender.email, "sender@example.test");
  assert.equal(captured.body.to[0].email, booking.email);
  assert.equal(captured.body.textContent, "plain");
  assert.equal(captured.body.headers.idempotencyKey, "d97bfe79-25f2-4669-b3a0-b3c38704e0b7");
});

test("Brevo provider failures become safe retryable error codes", async () => {
  const { sendTransactionalEmailWithBrevo } = await loadTypeScript("lib/brevo-client.ts");
  await assert.rejects(() => sendTransactionalEmailWithBrevo(
    { apiKey: "test-only-key", senderEmail: "sender@example.test", senderName: "Sangam Parlour" },
    { recipientEmail: booking.email, recipientName: booking.name, idempotencyKey: "d97bfe79-25f2-4669-b3a0-b3c38704e0b7", content: { subject: "subject", html: "html", text: "plain" } },
    async () => new Response("provider details omitted", { status: 503 }),
  ), (error) => error.code === "brevo_http_503" && error.retryable === true && !error.message.includes("provider details"));
});

test("invalid recipient is rejected before making a provider request", async () => {
  const { sendTransactionalEmailWithBrevo } = await loadTypeScript("lib/brevo-client.ts");
  let called = false;
  await assert.rejects(() => sendTransactionalEmailWithBrevo(
    { apiKey: "test-only-key", senderEmail: "sender@example.test", senderName: "Sangam Parlour" },
    { recipientEmail: "invalid", recipientName: "Customer", idempotencyKey: "d97bfe79-25f2-4669-b3a0-b3c38704e0b7", content: { subject: "subject", html: "html", text: "plain" } },
    async () => { called = true; return new Response(null, { status: 201 }); },
  ), (error) => error.code === "invalid_email_address");
  assert.equal(called, false);
});
