import { setRequestLocale } from "next-intl/server";
import { signIn } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function SigninPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  async function emailSignin(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    if (!email) return;
    await signIn("nodemailer", { email, redirectTo: `/${locale}/account` });
  }

  return (
    <section className="container-x py-24 max-w-md">
      <h1 className="text-4xl font-semibold tracking-tight">
        {locale === "it" ? "Accedi" : "Sign in"}
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        {locale === "it"
          ? "Ti invieremo un link magico per accedere senza password."
          : "We'll email you a magic sign-in link — no password needed."}
      </p>
      <form action={emailSignin} className="mt-8 space-y-3">
        <Input name="email" type="email" placeholder="you@example.com" required />
        <Button type="submit" className="w-full">
          {locale === "it" ? "Invia link" : "Send link"}
        </Button>
      </form>
    </section>
  );
}
