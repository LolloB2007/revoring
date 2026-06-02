import Link from "next/link";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { getCartView } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QtyControl } from "@/components/shop/QtyControl";
import { CheckoutButton } from "@/components/shop/CheckoutButton";

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  let view: Awaited<ReturnType<typeof getCartView>> | null = null;
  try {
    view = await getCartView();
  } catch {
    view = null;
  }
  const items = view?.items ?? [];
  const subtotal = view?.subtotalCents ?? 0;

  return (
    <section className="container-x py-16 max-w-5xl">
      <h1 className="text-4xl font-semibold tracking-tight">
        {locale === "it" ? "Carrello" : "Cart"}
      </h1>
      {items.length === 0 ? (
        <div className="mt-10 text-neutral-600">
          <p>{locale === "it" ? "Il carrello è vuoto." : "Your cart is empty."}</p>
          <Button asChild className="mt-6">
            <Link href={`/${locale}/catalogue`}>
              {locale === "it" ? "Vai al catalogo" : "Browse catalogue"}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[2fr_1fr]">
          <ul className="divide-y divide-neutral-200">
            {items.map((i) => {
              const name = i.nameI18n[locale as "it" | "en"] ?? i.nameI18n.en;
              return (
                <li key={i.itemId} className="py-4 flex gap-4">
                  <div className="relative h-24 w-24 bg-neutral-100 rounded overflow-hidden">
                    {i.image && (
                      <Image src={i.image} alt={name} fill sizes="96px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/${locale}/catalogue/${i.productSlug}`}
                      className="font-medium hover:underline"
                    >
                      {name}
                    </Link>
                    <p className="text-sm text-neutral-500">SKU {i.sku}</p>
                    <div className="mt-2"><QtyControl variantId={i.variantId} qty={i.qty} max={i.stock} /></div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatPrice(i.lineTotalCents, i.currency, locale === "it" ? "it-IT" : "en-US")}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
          <aside className="lg:sticky lg:top-24 self-start rounded-lg border border-neutral-200 bg-white p-6">
            <p className="flex justify-between text-sm">
              <span>{locale === "it" ? "Subtotale" : "Subtotal"}</span>
              <span>
                {formatPrice(subtotal, items[0]?.currency ?? "EUR", locale === "it" ? "it-IT" : "en-US")}
              </span>
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {locale === "it" ? "Spedizione calcolata al checkout." : "Shipping at checkout."}
            </p>
            <CheckoutButton locale={locale as "it" | "en"} />
          </aside>
        </div>
      )}
    </section>
  );
}
