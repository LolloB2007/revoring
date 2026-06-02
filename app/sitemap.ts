import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { locales } from "@/i18n";

const staticPaths = ["", "/catalogue", "/about", "/blog", "/contacts", "/legal/privacy", "/legal/cookies", "/legal/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_SITE_URL;
  const now = new Date();
  return locales.flatMap((locale) =>
    staticPaths.map((p) => ({
      url: `${base}/${locale}${p}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${base}/${l}${p}`])),
      },
    })),
  );
  // TODO(phase-5): merge in product + blog slugs from DB.
}
