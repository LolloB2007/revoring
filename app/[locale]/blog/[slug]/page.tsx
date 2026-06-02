import { notFound } from "next/navigation";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { env } from "@/lib/env";
import type { Locale } from "@/i18n";

export const revalidate = 60;

interface RouteParams {
  locale: string;
  slug: string;
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }) {
  const { locale, slug } = await params;
  const [post] = await db
    .select()
    .from(schema.blogPosts)
    .where(eq(schema.blogPosts.slug, slug));
  if (!post) return {};
  const title = post.titleI18n[locale as "it" | "en"] ?? post.titleI18n.en;
  const description = post.excerptI18n[locale as "it" | "en"] ?? post.excerptI18n.en;
  return buildMetadata({
    locale: locale as Locale,
    path: `/blog/${slug}`,
    title,
    description,
    ogImage: post.coverUrl ?? undefined,
    article: { publishedAt: post.publishedAt?.toISOString(), author: "Revoring" },
  });
}

export default async function BlogPostPage({ params }: { params: Promise<RouteParams> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [post] = await db.select().from(schema.blogPosts).where(eq(schema.blogPosts.slug, slug));
  if (!post || !post.publishedAt) notFound();

  const title = post.titleI18n[locale as "it" | "en"] ?? post.titleI18n.en;
  const html = post.bodyI18n[locale as "it" | "en"] ?? post.bodyI18n.en;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    image: post.coverUrl ? [post.coverUrl] : undefined,
    datePublished: post.publishedAt.toISOString(),
    author: { "@type": "Organization", name: "Revoring" },
    publisher: { "@type": "Organization", name: "Revoring" },
    mainEntityOfPage: `${env.NEXT_PUBLIC_SITE_URL}/${locale}/blog/${slug}`,
  };

  return (
    <article className="container-x py-16 max-w-3xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      {post.coverUrl && (
        <div className="aspect-[16/9] bg-neutral-100 rounded-lg overflow-hidden relative mb-10">
          <Image
            src={post.coverUrl}
            alt={post.coverAlt ?? title}
            fill
            sizes="(min-width: 1024px) 768px, 100vw"
            priority
            className="object-cover"
          />
        </div>
      )}
      <h1 className="text-5xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 text-sm text-neutral-500">
        {post.publishedAt.toLocaleDateString(locale === "it" ? "it-IT" : "en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <div
        className="prose prose-neutral mt-10 max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
