import { setRequestLocale } from "next-intl/server";

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <section className="container-x py-24">
      <h1 className="text-5xl font-semibold tracking-tight">Cart</h1>
      <p className="mt-4 text-neutral-600">Phase 6 — cart + Stripe checkout.</p>
    </section>
  );
}
