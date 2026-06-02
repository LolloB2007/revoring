import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n";

export const revalidate = 60;

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

  // Pull admin-edited copy if present; fall back to the seed below.
  let body: string | null = null;
  try {
    const [row] = await db.select().from(schema.pages).where(eq(schema.pages.key, "about"));
    body = row?.bodyI18n?.[locale as "it" | "en"] ?? null;
  } catch {
    body = null;
  }

  return (
    <>
      <section className="container-x py-16 md:py-24 grid gap-12 md:grid-cols-2 items-center">
        <div>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">
            {locale === "it" ? "Chi siamo" : "About Revoring"}
          </h1>
          {body ? (
            <div
              className="prose prose-neutral mt-6 max-w-none"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          ) : (
            <p className="mt-6 text-lg leading-relaxed text-neutral-700">
              {locale === "it"
                ? "Revoring nasce dall'idea di un allenamento funzionale semplice, modulare e portatile. Un solo attrezzo, infinite possibilità — usato da atleti, palestre e nella nostra Academy di certificazione."
                : "Revoring is built on a single idea: functional training that's simple, modular, and portable. One tool, infinite possibilities — trusted by athletes, gyms, and our own certification Academy."}
            </p>
          )}
        </div>
        <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-neutral-100">
          <Image
            src="/brand/about.png"
            alt={locale === "it" ? "Sessione di allenamento Revoring" : "Revoring training session"}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>
    </>
  );
}
