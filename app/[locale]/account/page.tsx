import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/account/signin`);
  return (
    <section className="container-x py-24 max-w-2xl">
      <h1 className="text-5xl font-semibold tracking-tight">Account</h1>
      <p className="mt-4 text-neutral-600">{session.user.email}</p>
    </section>
  );
}
