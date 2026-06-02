import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return buildMetadata({
    locale: locale as Locale,
    path: "/catalogue",
    title: t("catalogue"),
    description: "Revoring catalogue — elastic training systems",
  });
}

export default async function CataloguePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <section className="container-x py-24">
      <h1 className="text-5xl font-semibold tracking-tight">Catalogue</h1>
      <p className="mt-4 text-neutral-600">Phase 5 — product catalogue lives here.</p>
    </section>
  );
}
