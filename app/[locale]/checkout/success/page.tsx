import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";

export default async function CheckoutSuccess({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <section className="container-x py-24 max-w-2xl text-center">
      <h1 className="text-5xl font-semibold tracking-tight">
        {locale === "it" ? "Grazie!" : "Thank you!"}
      </h1>
      <p className="mt-4 text-lg text-neutral-700">
        {locale === "it"
          ? "Il pagamento è stato completato. Riceverai una conferma via email."
          : "Your payment is complete. A confirmation will arrive by email shortly."}
      </p>
      <Button asChild className="mt-10">
        <Link href={`/${locale}/account`}>
          {locale === "it" ? "I miei ordini" : "My orders"}
        </Link>
      </Button>
    </section>
  );
}
