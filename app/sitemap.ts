import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { locales } from "@/i18n";
import { store } from "@/lib/store";
import { TABLES, type Product, type BlogPost } from "@/lib/models";

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
    const products = await store.findMany<Product>(TABLES.products, (p) => p.isActive);
    for (const p of products) {
      for (const locale of locales) {
        entries.push({
          url: `${base}/${locale}/catalogue/${p.slug}`,
          lastModified: new Date(p.updatedAt),
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

    const posts = await store.findMany<BlogPost>(TABLES.blogPosts, (p) => !!p.publishedAt);
    for (const post of posts) {
      for (const locale of locales) {
        entries.push({
          url: `${base}/${locale}/blog/${post.slug}`,
          lastModified: new Date(post.updatedAt),
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
    /* empty store at build time */
  }

  return entries;
}
