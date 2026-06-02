import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { ContactForm } from "@/components/site/ContactForm";
import type { Locale } from "@/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contacts" });
  return buildMetadata({
    locale: locale as Locale,
    path: "/contacts",
    title: t("title"),
    description: "Contact Revoring",
  });
}

export default async function ContactsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contacts" });
  return (
    <section className="container-x py-24 max-w-2xl">
      <h1 className="text-5xl font-semibold tracking-tight">{t("title")}</h1>
      <div className="mt-10">
        <ContactForm locale={locale as Locale} />
      </div>
    </section>
  );
}
