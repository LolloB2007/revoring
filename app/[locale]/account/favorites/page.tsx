import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { store } from "@/lib/store";
import { TABLES, type Favorite, type Product } from "@/lib/models";
import { auth } from "@/lib/auth";

export default async function FavoritesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/account/signin`);

  const favs = await store.findMany<Favorite>(
    TABLES.favorites,
    (f) => f.userId === session.user.id,
  );
  const products = await store.all<Product>(TABLES.products);
  const rows = favs
    .map((f) => products.find((p) => p.id === f.productId))
    .filter((p): p is Product => Boolean(p));

  return (
    <section className="container-x py-16 max-w-5xl">
      <h1 className="text-4xl font-semibold tracking-tight">
        {locale === "it" ? "Preferiti" : "Favorites"}
      </h1>
      {rows.length === 0 ? (
        <p className="mt-6 text-neutral-600">
          {locale === "it" ? "Nessun preferito." : "No favorites yet."}
        </p>
      ) : (
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => (
            <Link key={p.id} href={`/${locale}/catalogue/${p.slug}`} className="block">
              <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden relative">
                {p.images[0]?.url && (
                  <Image
                    src={p.images[0].url}
                    alt={p.images[0].alt}
                    fill
                    sizes="33vw"
                    className="object-cover"
                  />
                )}
              </div>
              <p className="mt-2 font-medium">
                {p.nameI18n[locale as "it" | "en"] ?? p.nameI18n.en}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
