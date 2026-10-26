import { getStudioContent } from "./db.js";
import { throttle } from "./auth.js";
import { StudioError } from "./errors.js";

// No new database tables or persisted visitor messages.
// The owner sets a public contact email; verified Resend credentials enable delivery.
export function contactDeliveryEnabled(env = process.env) {
  return Boolean(env.RESEND_API_KEY && env.PORTFOLIO_FROM_EMAIL);
}

export function validateContact(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new StudioError(422, "Please complete the contact form.");
  }
  // Validate the original strings before trimming: leading/trailing CRLF must
  // never be silently accepted in fields later used in email headings.
  for (const field of ["name", "email", "subject"]) {
    if (typeof input[field] === "string" && /[\r\n]/.test(input[field])) {
      throw new StudioError(422, "Remove line breaks from name, email and subject.");
    }
  }
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const subject = typeof input.subject === "string" ? input.subject.trim() : "";
  const message = typeof input.message === "string" ? input.message.trim() : "";
  if (input.website) throw new StudioError(422, "Unable to send this message.");
  if (input.consent !== true) throw new StudioError(422, "Please agree to send your message.");
  if (name.length < 2 || name.length > 80 || /[\r\n]/.test(name)) throw new StudioError(422, "Enter your name (2–80 characters).");
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\r\n]/.test(email)) {
    throw new StudioError(422, "Enter a valid email address.");
  }
  if (subject.length < 4 || subject.length > 120 || /[\r\n]/.test(subject)) throw new StudioError(422, "Enter a short subject (4–120 characters).");
  if (message.length < 20 || message.length > 3000) throw new StudioError(422, "Message must be 20–3000 characters.");
  return { name, email, subject, message };
}

// Isolated provider boundary for deterministic delivery-contract tests.
// Never treat an HTTP failure as successful message delivery.
export async function deliverContactViaResend({ recipient, payload, fetcher = fetch, env = process.env }) {
  const body = [
    "New portfolio enquiry",
    "From: " + payload.name,
    "Email: " + payload.email,
    "Subject: " + payload.subject,
    "",
    payload.message,
  ].join("\n");
  const emailResponse = await fetcher("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.PORTFOLIO_FROM_EMAIL,
      to: [recipient],
      reply_to: payload.email,
      subject: "Portfolio enquiry: " + payload.subject,
      text: body,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!emailResponse.ok) throw new StudioError(503, "The message could not be delivered. Please email directly instead.");
  return true;
}

export async function submitContact(request, response) {
  // Always validate and rate-limit before contacting an external email service.
  const payload = validateContact(request.body);
  await throttle("contact-ip:" + String(request.ip || "unknown"), 4, 3600);
  await throttle("contact-email:" + payload.email, 4, 3600);
  const { content } = await getStudioContent();
  if (!content.email || !contactDeliveryEnabled()) {
    throw new StudioError(503, "The contact form is unavailable. Please use the direct email link instead.");
  }
  await deliverContactViaResend({ recipient: content.email, payload });
  response.status(202).json({ sent: true });
}
