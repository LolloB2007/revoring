import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { store } from "@/lib/store";
import { TABLES, type Product, type ProductVariant, type Favorite } from "@/lib/models";
import { buildMetadata } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { FavoriteButton } from "@/components/shop/FavoriteButton";
import { AdminEditLink } from "@/components/admin/AdminEditLink";
import { auth } from "@/lib/auth";
import type { Locale } from "@/i18n";
import { env } from "@/lib/env";

interface RouteParams {
  locale: string;
  slug: string;
}

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<RouteParams> }) {
  const { locale, slug } = await params;
  const product = await store.findOne<Product>(TABLES.products, (p) => p.slug === slug);
  if (!product) return {};
  const name = product.nameI18n[locale as "it" | "en"] ?? product.nameI18n.en;
  const desc = product.descriptionI18n[locale as "it" | "en"] ?? product.descriptionI18n.en;
  return buildMetadata({
    locale: locale as Locale,
    path: `/catalogue/${slug}`,
    title: name,
    description: desc.slice(0, 160),
    ogImage: product.images[0]?.url,
  });
}

export default async function ProductPage({ params }: { params: Promise<RouteParams> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await store.findOne<Product>(TABLES.products, (p) => p.slug === slug);
  if (!product) notFound();

  const variants = await store.findMany<ProductVariant>(
    TABLES.variants,
    (v) => v.productId === product.id,
  );

  const session = await auth();
  let favorited = false;
  if (session?.user?.id) {
    const f = await store.findOne<Favorite>(
      TABLES.favorites,
      (x) => x.userId === session.user.id && x.productId === product.id,
    );
    favorited = !!f;
  }

  const name = product.nameI18n[locale as "it" | "en"] ?? product.nameI18n.en;
  const description = product.descriptionI18n[locale as "it" | "en"] ?? product.descriptionI18n.en;
  const defaultVariant = variants[0];

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: product.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      price: (product.priceCents / 100).toFixed(2),
      priceCurrency: product.currency,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${env.NEXT_PUBLIC_SITE_URL}/${locale}/catalogue/${slug}`,
    },
  };

  return (
    <section className="container-x py-16">
      <AdminEditLink href={`/admin/products/${product.id}`} variant="floating" label={locale === "it" ? "Modifica prodotto" : "Edit product"} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="aspect-square relative bg-neutral-100 rounded-lg overflow-hidden">
          {product.images[0]?.url && (
            <Image
              src={product.images[0].url}
              alt={product.images[0].alt}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          )}
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">{name}</h1>
          <p className="mt-4 text-2xl">
            {formatPrice(product.priceCents, product.currency, locale === "it" ? "it-IT" : "en-US")}
          </p>
          <p className="mt-6 text-neutral-700 leading-relaxed whitespace-pre-line">{description}</p>
          <div className="mt-10 flex gap-3 flex-wrap">
            {defaultVariant && (
              <AddToCartButton variantId={defaultVariant.id} disabled={defaultVariant.stock <= 0} />
            )}
            <FavoriteButton productId={product.id} initialFavorited={favorited} />
          </div>
          {product.stock <= 0 && (
            <p className="mt-4 text-sm text-red-600">
              {locale === "it" ? "Esaurito" : "Out of stock"}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
