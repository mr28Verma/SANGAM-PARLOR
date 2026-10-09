import type { TransactionalEmail } from "./email-templates";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class EmailDeliveryError extends Error {
  constructor(readonly code: string, readonly retryable: boolean) {
    super(code);
    this.name = "EmailDeliveryError";
  }
}

export async function sendTransactionalEmailWithBrevo(
  config: { apiKey: string; senderEmail: string; senderName: string },
  input: { recipientEmail: string; recipientName: string; idempotencyKey: string; content: TransactionalEmail },
  fetcher: typeof fetch = fetch,
) {
  if (!config.apiKey || !config.senderEmail || !config.senderName) throw new EmailDeliveryError("missing_configuration", true);
  if (!emailPattern.test(config.senderEmail) || !emailPattern.test(input.recipientEmail)) throw new EmailDeliveryError("invalid_email_address", false);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetcher("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": config.apiKey, "accept": "application/json", "content-type": "application/json" },
      body: JSON.stringify({
        sender: { name: config.senderName, email: config.senderEmail },
        to: [{ email: input.recipientEmail, name: input.recipientName }],
        subject: input.content.subject,
        htmlContent: input.content.html,
        textContent: input.content.text,
        headers: { idempotencyKey: input.idempotencyKey },
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      let duplicate = false;
      if (response.status === 400) {
        try { const body = await response.json() as { code?: string }; duplicate = body.code === "duplicate_parameter"; } catch { /* no response body details are logged */ }
      }
      if (duplicate) return { messageId: "", duplicate: true };
      throw new EmailDeliveryError(response.status === 429 ? "brevo_rate_limited" : `brevo_http_${response.status}`, response.status === 429 || response.status >= 500);
    }

    let body: { messageId?: string } = {};
    try { body = await response.json() as { messageId?: string }; } catch { /* a successful HTTP response still means Brevo accepted the request */ }
    return { messageId: typeof body.messageId === "string" ? body.messageId : "", duplicate: false };
  } catch (error) {
    if (error instanceof EmailDeliveryError) throw error;
    if (controller.signal.aborted) throw new EmailDeliveryError("brevo_timeout", true);
    throw new EmailDeliveryError("brevo_network_error", true);
  } finally {
    clearTimeout(timeout);
  }
}
