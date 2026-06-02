import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token || token.length < 20) return NextResponse.redirect(`${env.NEXT_PUBLIC_SITE_URL}/it`);

  const [row] = await db
    .select()
    .from(schema.newsletterSubscribers)
    .where(eq(schema.newsletterSubscribers.confirmationToken, token));
  if (!row) return NextResponse.redirect(`${env.NEXT_PUBLIC_SITE_URL}/it`);
  if (!row.confirmedAt) {
    await db
      .update(schema.newsletterSubscribers)
      .set({ confirmedAt: new Date() })
      .where(eq(schema.newsletterSubscribers.id, row.id));
  }
  return NextResponse.redirect(`${env.NEXT_PUBLIC_SITE_URL}/${row.locale}?newsletter=confirmed`);
}
