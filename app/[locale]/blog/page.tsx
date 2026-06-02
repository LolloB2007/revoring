import Link from "next/link";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { store } from "@/lib/store";
import { TABLES, type BlogPost } from "@/lib/models";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildMetadata({
    locale: locale as Locale,
    path: "/blog",
    title: "Blog",
    description: "Training, recovery, methodology from the Revoring team",
  });
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  let posts: BlogPost[] = [];
  try {
    const all = await store.findMany<BlogPost>(TABLES.blogPosts, (p) => !!p.publishedAt);
    posts = all.sort(
      (a, b) =>
        new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime(),
    );
  } catch {
    posts = [];
  }

  return (
    <section className="container-x py-16 md:py-24">
      <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">Blog</h1>
      {posts.length === 0 ? (
        <p className="mt-10 text-neutral-500">
          {locale === "it" ? "Articoli in arrivo." : "Articles coming soon."}
        </p>
      ) : (
        <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.id} href={`/${locale}/blog/${p.slug}`} className="group">
              <div className="aspect-[4/3] bg-neutral-100 rounded-lg overflow-hidden relative">
                {p.coverUrl && (
                  <Image
                    src={p.coverUrl}
                    alt={p.coverAlt ?? p.titleI18n.en}
                    fill
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                )}
              </div>
              <h2 className="mt-4 text-xl font-semibold tracking-tight">
                {p.titleI18n[locale as "it" | "en"] ?? p.titleI18n.en}
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                {p.excerptI18n[locale as "it" | "en"] ?? p.excerptI18n.en}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
