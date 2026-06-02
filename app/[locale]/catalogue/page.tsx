import Link from "next/link";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { store } from "@/lib/store";
import { TABLES, type Product } from "@/lib/models";
import { buildMetadata } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";
import type { Locale } from "@/i18n";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return buildMetadata({
    locale: locale as Locale,
    path: "/catalogue",
    title: t("catalogue"),
    description: "Revoring elastic training catalogue",
  });
}

export default async function CataloguePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  let products: Product[] = [];
  try {
    const all = await store.findMany<Product>(TABLES.products, (p) => p.isActive);
    products = all.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch {
    products = [];
  }

  return (
    <section className="container-x py-16 md:py-24">
      <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">
        {locale === "it" ? "Catalogo" : "Catalogue"}
      </h1>
      {products.length === 0 ? (
        <p className="mt-10 text-neutral-500">
          {locale === "it"
            ? "Il catalogo è in arrivo. I prodotti vengono caricati dall'admin."
            : "Catalogue coming soon — products will be added from the admin."}
        </p>
      ) : (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Link key={p.id} href={`/${locale}/catalogue/${p.slug}`} className="group block">
              <div className="aspect-square overflow-hidden rounded-lg bg-neutral-100 relative">
                {p.images[0]?.url && (
                  <Image
                    src={p.images[0].url}
                    alt={p.images[0].alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                )}
              </div>
              <h3 className="mt-4 text-lg font-medium tracking-tight">
                {p.nameI18n[locale as "it" | "en"] ?? p.nameI18n.en}
              </h3>
              <p className="text-sm text-neutral-600">
                {formatPrice(p.priceCents, p.currency, locale === "it" ? "it-IT" : "en-US")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
