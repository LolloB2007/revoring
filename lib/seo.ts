import type { Metadata } from "next";
import { env } from "./env";
import { locales, type Locale } from "@/i18n";

interface SeoInput {
  title: string;
  description: string;
  path: string;              // e.g. "/catalogue/elite-set" (no locale prefix)
  locale: Locale;
  ogImage?: string;
  article?: { publishedAt?: string; author?: string };
}

export function buildMetadata(i: SeoInput): Metadata {
  const url = `${env.NEXT_PUBLIC_SITE_URL}/${i.locale}${i.path}`;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${env.NEXT_PUBLIC_SITE_URL}/${l}${i.path}`;
  languages["x-default"] = `${env.NEXT_PUBLIC_SITE_URL}${i.path}`;

  return {
    title: i.title,
    description: i.description,
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title: i.title,
      description: i.description,
      url,
      siteName: "Revoring",
      locale: i.locale,
      images: i.ogImage ? [{ url: i.ogImage }] : undefined,
      type: i.article ? "article" : "website",
      ...(i.article && {
        publishedTime: i.article.publishedAt,
        authors: i.article.author ? [i.article.author] : undefined,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: i.title,
      description: i.description,
      images: i.ogImage ? [i.ogImage] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Revoring",
    url: env.NEXT_PUBLIC_SITE_URL,
    logo: `${env.NEXT_PUBLIC_SITE_URL}/brand/revoring-logo.png`,
    sameAs: [
      "https://www.instagram.com/revoring/",
    ],
  };
}
