"use server";

import { z } from "zod";
import { isNotNull } from "drizzle-orm";
import { headers } from "next/headers";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { sendBatch } from "@/lib/email";
import { sanitizeHtml } from "@/lib/sanitize";
import { logAudit } from "@/lib/audit";
import { buildUnsubscribeUrl } from "@/app/api/newsletter/unsubscribe/route";

const Input = z.object({
  subject_it: z.string().min(2).max(200),
  subject_en: z.string().min(2).max(200),
  body_it: z.string().max(80_000),
  body_en: z.string().max(80_000),
});

export async function sendBroadcastAction(fd: FormData): Promise<{ sent: number; failed: number }> {
  const session = await requireAdmin();
  const data = Input.parse({
    subject_it: fd.get("subject_it"),
    subject_en: fd.get("subject_en"),
    body_it: sanitizeHtml(String(fd.get("body_it") ?? "")),
    body_en: sanitizeHtml(String(fd.get("body_en") ?? "")),
  });

  const subs = await db
    .select({
      email: schema.newsletterSubscribers.email,
      locale: schema.newsletterSubscribers.locale,
    })
    .from(schema.newsletterSubscribers)
    .where(isNotNull(schema.newsletterSubscribers.confirmedAt));

  const messages = subs.map((s) => {
    const isIt = s.locale === "it";
    const html =
      (isIt ? data.body_it : data.body_en) +
      `<hr/><p style="font-size:11px;color:#888">` +
      `<a href="${buildUnsubscribeUrl(s.email)}">${isIt ? "Annulla iscrizione" : "Unsubscribe"}</a>` +
      `</p>`;
    return {
      to: s.email,
      subject: isIt ? data.subject_it : data.subject_en,
      html,
    };
  });

  const result = await sendBatch(messages, 5);
  await logAudit({
    actorId: session.user.id,
    actorEmail: session.user.email ?? null,
    action: "newsletter.broadcast",
    entityType: "newsletter",
    after: { recipients: subs.length, ...result },
    headers: await headers(),
  });
  return result;
}
