import { setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildMetadata({
    locale: locale as Locale,
    path: "/blog",
    title: "Blog",
    description: "Revoring blog — training, recovery, methodology",
  });
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <section className="container-x py-24">
      <h1 className="text-5xl font-semibold tracking-tight">Blog</h1>
      <p className="mt-4 text-neutral-600">Phase 8 — posts live here once the editor lands.</p>
    </section>
  );
}
