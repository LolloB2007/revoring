import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { TABLES, type NewsletterSubscriber } from "@/lib/models";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token || token.length < 20)
    return NextResponse.redirect(`${env.NEXT_PUBLIC_SITE_URL}/it`);

  const row = await store.findOne<NewsletterSubscriber>(
    TABLES.newsletterSubscribers,
    (s) => s.confirmationToken === token,
  );
  if (!row) return NextResponse.redirect(`${env.NEXT_PUBLIC_SITE_URL}/it`);
  if (!row.confirmedAt) {
    await store.updateWhere<NewsletterSubscriber>(
      TABLES.newsletterSubscribers,
      (s) => s.id === row.id,
      { confirmedAt: new Date() },
    );
  }
  return NextResponse.redirect(
    `${env.NEXT_PUBLIC_SITE_URL}/${row.locale}?newsletter=confirmed`,
  );
}
