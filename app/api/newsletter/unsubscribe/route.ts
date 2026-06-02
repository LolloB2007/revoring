import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { store } from "@/lib/store";
import { TABLES, type NewsletterSubscriber } from "@/lib/models";
import { env } from "@/lib/env";

function unsubSig(email: string): string {
  return createHmac("sha256", env.AUTH_SECRET ?? "dev-secret")
    .update(email)
    .digest("hex")
    .slice(0, 32);
}

export function buildUnsubscribeUrl(email: string): string {
  const sig = unsubSig(email);
  const qs = new URLSearchParams({ email, sig });
  return `${env.NEXT_PUBLIC_SITE_URL}/api/newsletter/unsubscribe?${qs.toString()}`;
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  const sig = req.nextUrl.searchParams.get("sig");
  if (!email || !sig) return NextResponse.json({ error: "missing" }, { status: 400 });
  if (sig !== unsubSig(email)) return NextResponse.json({ error: "bad-signature" }, { status: 400 });
  await store.updateWhere<NewsletterSubscriber>(
    TABLES.newsletterSubscribers,
    (s) => s.email === email.toLowerCase(),
    { unsubscribedAt: new Date() },
  );
  return NextResponse.json({ ok: true });
}
