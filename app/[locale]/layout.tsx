import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { locales, type Locale } from "@/i18n";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CookieBanner } from "@/components/site/CookieBanner";
import { ConsentScripts } from "@/components/site/ConsentScripts";
import { env } from "@/lib/env";
import { organizationLd } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang={locale} className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        <NextIntlClientProvider locale={locale as Locale} messages={messages}>
          <SiteHeader locale={locale as Locale} />
          <main className="flex-1">{children}</main>
          <SiteFooter locale={locale as Locale} />
          <CookieBanner />
          <ConsentScripts />
        </NextIntlClientProvider>
        <script
          type="application/ld+json"
          nonce={nonce}
          // Browsers hide the nonce attribute after parse (CSP-spec), which
          // causes a benign client/server diff. The content is a static
          // constant, so suppress the warning here.
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd()) }}
        />
      </body>
    </html>
  );
}
