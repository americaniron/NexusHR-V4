import { logger } from "./logger";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export type EmailTransport = (message: EmailMessage) => Promise<boolean>;

let _transport: EmailTransport = logTransport;

async function logTransport(message: EmailMessage): Promise<boolean> {
  logger.info(
    { to: message.to, subject: message.subject },
    `[Email] Logged (no provider configured): ${message.subject}`,
  );
  return true;
}

async function resendTransport(message: EmailMessage): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.warn("[Email] RESEND_API_KEY not set, falling back to log transport");
    return logTransport(message);
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "NexsusHR <noreply@nexushr.ai>",
      to: [message.to],
      subject: message.subject,
      text: message.text,
      html: message.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    logger.error({ status: response.status, body, to: message.to }, "[Email] Resend API error");
    return false;
  }

  logger.info({ to: message.to, subject: message.subject }, "[Email] Sent via Resend");
  return true;
}

export function initializeEmailTransport(): void {
  if (process.env.RESEND_API_KEY) {
    _transport = resendTransport;
    logger.info("[Email] Using Resend transport");
  } else {
    _transport = logTransport;
    logger.info("[Email] No email provider configured — using log transport. Set RESEND_API_KEY to enable delivery.");
  }
}

export async function sendEmail(message: EmailMessage): Promise<boolean> {
  try {
    return await _transport(message);
  } catch (err) {
    logger.error({ err, to: message.to }, "[Email] Failed to send email");
    return false;
  }
}

export function setEmailTransport(transport: EmailTransport): void {
  _transport = transport;
}
