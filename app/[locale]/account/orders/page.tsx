import Link from "next/link";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";

export default async function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/account/signin`);

  const orders = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.userId, session.user.id))
    .orderBy(desc(schema.orders.createdAt));

  return (
    <section className="container-x py-16 max-w-3xl">
      <h1 className="text-4xl font-semibold tracking-tight">
        {locale === "it" ? "I miei ordini" : "My orders"}
      </h1>
      {orders.length === 0 ? (
        <p className="mt-6 text-neutral-600">
          {locale === "it" ? "Nessun ordine ancora." : "No orders yet."}
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-neutral-200">
          {orders.map((o) => (
            <li key={o.id} className="py-4 flex items-center justify-between">
              <div>
                <p className="font-medium">#{o.id.slice(0, 8)}</p>
                <p className="text-sm text-neutral-500">{o.createdAt.toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p>{formatPrice(o.totalCents, o.currency, locale === "it" ? "it-IT" : "en-US")}</p>
                <p className="text-sm text-neutral-500">{o.status}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Link href={`/${locale}/account`} className="mt-10 inline-block text-sm underline">
        ← Account
      </Link>
    </section>
  );
}
