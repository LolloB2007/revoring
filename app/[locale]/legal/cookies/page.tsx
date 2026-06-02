import { setRequestLocale } from "next-intl/server";

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <section className="container-x py-24 max-w-3xl prose prose-neutral">
      <h1>{locale === "it" ? "Cookie policy" : "Cookie policy"}</h1>
      <p className="text-sm text-neutral-500">
        {locale === "it"
          ? "Necessari, analitici (opt-in), marketing (opt-in). Aggiornabile da /admin/pages."
          : "Necessary, analytics (opt-in), marketing (opt-in). Editable via /admin/pages."}
      </p>
    </section>
  );
}
