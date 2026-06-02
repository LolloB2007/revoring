import nodemailer, { type Transporter } from "nodemailer";
import { env } from "./env";

let cachedTransport: Transporter | null = null;

function getTransport(): Transporter | null {
  if (cachedTransport) return cachedTransport;
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null;
  cachedTransport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  return cachedTransport;
}

export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendMail(input: SendMailInput): Promise<{ ok: boolean; reason?: string }> {
  const tx = getTransport();
  if (!tx) {
    if (env.NODE_ENV !== "production") {
      console.warn("[email] SMTP not configured — logging mail to console:", input);
      return { ok: true, reason: "logged-only" };
    }
    return { ok: false, reason: "smtp-not-configured" };
  }
  try {
    await tx.sendMail({
      from: env.SMTP_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
    });
    return { ok: true };
  } catch (e) {
    console.error("[email] send failed", e);
    return { ok: false, reason: (e as Error).message };
  }
}

/**
 * Batch send with throttling. Respects per-second limits typical of company
 * mailboxes (e.g. Google Workspace ~10 msg/sec). Adjust BATCH_PER_SEC via env
 * if needed.
 */
export async function sendBatch(
  list: SendMailInput[],
  perSecond = 5,
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  const delay = 1000 / perSecond;
  for (const item of list) {
    const res = await sendMail(item);
    if (res.ok) sent++;
    else failed++;
    await new Promise((r) => setTimeout(r, delay));
  }
  return { sent, failed };
}
