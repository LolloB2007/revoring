import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { sendMail } from "@/lib/email";
import { limiters, clientIp } from "@/lib/rate-limit";
import { env } from "@/lib/env";

const Body = z.object({
  email: z.string().email().max(200),
  locale: z.enum(["it", "en"]).default("it"),
});

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const rl = await limiters.newsletter.limit(`nl:${ip}`);
  if (!rl.success) return NextResponse.json({ error: "rate-limited" }, { status: 429 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid-input" }, { status: 400 });
  const email = parsed.data.email.toLowerCase();
  const locale = parsed.data.locale;

  // Upsert subscriber.
  const existing = await db
    .select()
    .from(schema.newsletterSubscribers)
    .where(eq(schema.newsletterSubscribers.email, email));
  if (existing[0]?.confirmedAt) {
    // Don't leak existence — return a generic OK with a marker the client can show neutrally.
    return NextResponse.json({ ok: true, alreadyConfirmed: true });
  }

  const token = nanoid(40);
  if (existing[0]) {
    await db
      .update(schema.newsletterSubscribers)
      .set({ confirmationToken: token, locale })
      .where(eq(schema.newsletterSubscribers.id, existing[0].id));
  } else {
    await db.insert(schema.newsletterSubscribers).values({
      email,
      locale,
      confirmationToken: token,
    });
  }

  const confirmUrl = `${env.NEXT_PUBLIC_SITE_URL}/api/newsletter/confirm?token=${token}`;
  const subject = locale === "it" ? "Conferma la tua iscrizione" : "Confirm your subscription";
  const cta = locale === "it" ? "Conferma email" : "Confirm email";
  const body = locale === "it"
    ? `Clicca per confermare la tua iscrizione alla newsletter Revoring.`
    : `Click to confirm your subscription to the Revoring newsletter.`;
  await sendMail({
    to: email,
    subject,
    html: `<p>${body}</p><p><a href="${confirmUrl}">${cta}</a></p>`,
    text: `${body}\n\n${confirmUrl}`,
  });

  return NextResponse.json({ ok: true });
}
