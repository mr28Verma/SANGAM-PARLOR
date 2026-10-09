import "server-only";
import { EmailDeliveryError, sendTransactionalEmailWithBrevo } from "./brevo-client";
import type { TransactionalEmail } from "./email-templates";

export { EmailDeliveryError };

export async function sendBrevoEmail(input: {
  recipientEmail: string;
  recipientName: string;
  idempotencyKey: string;
  content: TransactionalEmail;
}) {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
  const senderName = process.env.BREVO_SENDER_NAME?.trim();
  if (!apiKey || !senderEmail || !senderName) throw new EmailDeliveryError("missing_configuration", true);

  return sendTransactionalEmailWithBrevo({ apiKey, senderEmail, senderName }, input);
}
