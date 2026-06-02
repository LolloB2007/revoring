import { setRequestLocale } from "next-intl/server";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <section className="container-x py-24 max-w-3xl prose prose-neutral">
      <h1>{locale === "it" ? "Informativa sulla privacy" : "Privacy policy"}</h1>
      <p className="text-sm text-neutral-500">
        {locale === "it"
          ? "Contenuto da incollare dal cliente tramite /admin/pages (Phase 9)."
          : "Content pasted by client via /admin/pages (Phase 9)."}
      </p>
    </section>
  );
}
