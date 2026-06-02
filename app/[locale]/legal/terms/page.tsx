import { setRequestLocale } from "next-intl/server";

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <section className="container-x py-24 max-w-3xl prose prose-neutral">
      <h1>{locale === "it" ? "Termini di vendita" : "Terms of sale"}</h1>
      <p className="text-sm text-neutral-500">
        {locale === "it"
          ? "Modificabili dal cliente via /admin/pages."
          : "Editable by the client via /admin/pages."}
      </p>
    </section>
  );
}
