import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { SignupForm } from "@/components/site/SignupForm";

export default async function SignupPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const isIt = locale === "it";

  return (
    <section className="container-x py-24 max-w-md">
      <h1 className="text-4xl font-semibold tracking-tight">
        {isIt ? "Crea il tuo account" : "Create your account"}
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        {isIt
          ? "Per ordini, preferiti e accesso al supporto."
          : "For orders, favorites, and access to support."}
      </p>

      <SignupForm locale={locale as "it" | "en"} />

      <p className="mt-8 text-sm text-neutral-600">
        {isIt ? "Hai già un account? " : "Already have an account? "}
        <Link
          href={`/${locale}/account/signin${sp.callbackUrl ? `?callbackUrl=${encodeURIComponent(sp.callbackUrl)}` : ""}`}
          className="underline underline-offset-4 hover:text-neutral-900"
        >
          {isIt ? "Accedi" : "Sign in"}
        </Link>
      </p>
    </section>
  );
}
