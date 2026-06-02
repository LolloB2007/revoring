import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { sendMail } from "@/lib/email";
import { limiters, clientIp } from "@/lib/rate-limit";
import { env } from "@/lib/env";

const Body = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  message: z.string().min(10).max(4000),
  locale: z.enum(["it", "en"]).default("it"),
});

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const rl = await limiters.contact.limit(`contact:${ip}`);
  if (!rl.success) return NextResponse.json({ error: "rate-limited" }, { status: 429 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  await db.insert(schema.contactSubmissions).values({
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
    locale: parsed.data.locale,
    ip,
    userAgent: req.headers.get("user-agent")?.slice(0, 512) ?? null,
  });

  await sendMail({
    to: env.ADMIN_EMAIL,
    subject: `New contact form: ${parsed.data.name}`,
    replyTo: parsed.data.email,
    html: `<p><b>${parsed.data.name}</b> (${parsed.data.email})</p><p>${parsed.data.message.replace(
      /</g,
      "&lt;",
    )}</p>`,
    text: `${parsed.data.name} <${parsed.data.email}>\n\n${parsed.data.message}`,
  });

  return NextResponse.json({ ok: true });
}
