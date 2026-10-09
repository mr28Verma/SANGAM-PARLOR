import assert from "node:assert/strict";
import { test } from "node:test";

// Opt-in integration tests use a real, isolated Next.js deployment and MongoDB.
// Set the environment variables below only for a disposable test database and
// test contact details. Successful creation reserves the chosen slot.
const bookingBaseUrl = process.env.APPOINTMENT_TEST_BASE_URL?.replace(/\/$/, "");
const databaseErrorBaseUrl = process.env.APPOINTMENT_ERROR_TEST_BASE_URL?.replace(/\/$/, "");
const booking = {
  service: process.env.APPOINTMENT_TEST_SERVICE,
  date: process.env.APPOINTMENT_TEST_DATE,
  time: process.env.APPOINTMENT_TEST_TIME,
  name: process.env.APPOINTMENT_TEST_NAME,
  phone: process.env.APPOINTMENT_TEST_PHONE,
  email: process.env.APPOINTMENT_TEST_EMAIL ?? "",
  specialRequests: "",
};
const bookingConfigured = Boolean(
  bookingBaseUrl && booking.service && booking.date && booking.time && booking.name && booking.phone,
);

async function submitBooking(baseUrl, body = booking) {
  return fetch(`${baseUrl}/api/appointments`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("real booking creation succeeds and a retry for the same slot is rejected", {
  skip: !bookingConfigured,
}, async () => {
  const response = await submitBooking(bookingBaseUrl);
  const result = await response.json();
  assert.equal(response.status, 201, JSON.stringify(result));
  assert.ok(result.bookingReference);

  const retry = await submitBooking(bookingBaseUrl);
  const retryResult = await retry.json();
  assert.equal(retry.status, 409, JSON.stringify(retryResult));
});

test("database connection failures return 503 without a booking success response", {
  skip: !databaseErrorBaseUrl || !booking.service || !booking.date || !booking.time || !booking.name || !booking.phone,
}, async () => {
  const response = await submitBooking(databaseErrorBaseUrl);
  const result = await response.json();
  assert.equal(response.status, 503, JSON.stringify(result));
  assert.match(result.error ?? "", /temporarily unavailable/i);
  assert.equal(result.bookingReference, undefined);
});
