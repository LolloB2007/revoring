import { setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildMetadata({
    locale: locale as Locale,
    path: "/about",
    title: locale === "it" ? "Chi siamo" : "About",
    description: "Revoring — One Infinite Training",
  });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <section className="container-x py-24 max-w-3xl">
      <h1 className="text-5xl font-semibold tracking-tight">
        {locale === "it" ? "Chi siamo" : "About Revoring"}
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-neutral-700">
        {locale === "it"
          ? "Revoring nasce dall'idea di un allenamento funzionale semplice, modulare e portatile. Un attrezzo, infinite possibilità."
          : "Revoring is built on a single idea: functional training that's simple, modular, and portable. One tool, infinite possibilities."}
      </p>
      <p className="mt-4 text-sm text-neutral-500">
        TODO(admin/pages): replace with copy from /admin/pages once Phase 9 lands.
      </p>
    </section>
  );
}
