import type { MetadataRoute } from "next";
import { eq, isNotNull } from "drizzle-orm";
import { env } from "@/lib/env";
import { locales } from "@/i18n";
import { db, schema } from "@/lib/db";

const staticPaths = [
  "",
  "/catalogue",
  "/about",
  "/blog",
  "/contacts",
  "/legal/privacy",
  "/legal/cookies",
  "/legal/terms",
];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_SITE_URL;
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const p of staticPaths) {
      entries.push({
        url: `${base}/${locale}${p}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: p === "" ? 1 : 0.7,
        alternates: {
          languages: Object.fromEntries(locales.map((l) => [l, `${base}/${l}${p}`])),
        },
      });
    }
  }

  try {
    const products = await db
      .select({ slug: schema.products.slug, updatedAt: schema.products.updatedAt })
      .from(schema.products)
      .where(eq(schema.products.isActive, true));
    for (const p of products) {
      for (const locale of locales) {
        entries.push({
          url: `${base}/${locale}/catalogue/${p.slug}`,
          lastModified: p.updatedAt,
          changeFrequency: "weekly",
          priority: 0.8,
          alternates: {
            languages: Object.fromEntries(
              locales.map((l) => [l, `${base}/${l}/catalogue/${p.slug}`]),
            ),
          },
        });
      }
    }

    const posts = await db
      .select({ slug: schema.blogPosts.slug, updatedAt: schema.blogPosts.updatedAt })
      .from(schema.blogPosts)
      .where(isNotNull(schema.blogPosts.publishedAt));
    for (const post of posts) {
      for (const locale of locales) {
        entries.push({
          url: `${base}/${locale}/blog/${post.slug}`,
          lastModified: post.updatedAt,
          changeFrequency: "monthly",
          priority: 0.6,
          alternates: {
            languages: Object.fromEntries(
              locales.map((l) => [l, `${base}/${l}/blog/${post.slug}`]),
            ),
          },
        });
      }
    }
  } catch {
    // DB unavailable at build time — only static paths included.
  }

  return entries;
}
