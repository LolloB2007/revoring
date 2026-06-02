import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { store } from "@/lib/store";
import { TABLES, type Page } from "@/lib/models";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildMetadata({
    locale: locale as Locale,
    path: "/about",
    title: locale === "it" ? "Chi siamo" : "About",
    description:
      "Revoring — One Infinite Training. Il sistema di allenamento funzionale a 14 anelli elastici sviluppato a Cesena.",
  });
}

interface Block {
  eyebrowIt: string;
  eyebrowEn: string;
  titleIt: string;
  titleEn: string;
  bodyIt: string;
  bodyEn: string;
}

const BLOCKS: Block[] = [
  {
    eyebrowIt: "IL PRODOTTO",
    eyebrowEn: "THE PRODUCT",
    titleIt: "Una catena di 14 anelli elastici. Infinite impugnature.",
    titleEn: "A chain of 14 elastic rings. Infinite grips.",
    bodyIt:
      "Revoring® è il primo attrezzo di fitness all-in-one: una catena di 14 anelli elastici con molteplici impugnature. Permette di regolare l'intensità di ogni esercizio e di trovare punti di ancoraggio diversi — a casa, in palestra, all'aperto.",
    bodyEn:
      "Revoring® is the first all-in-one fitness tool: a 14-ring elastic chain with multiple grips. Adjust the intensity of every exercise and find different anchoring points — at home, in the gym, outdoors.",
  },
  {
    eyebrowIt: "LA METODOLOGIA",
    eyebrowEn: "THE METHOD",
    titleIt: "Il sistema più versatile per l'allenamento funzionale.",
    titleEn: "The most versatile functional training system.",
    bodyIt:
      "Suspension, circuit, personal training, gruppi, stretching, pilates, allenamento posturale, riabilitazione, fisioterapia, preparazione atletica. Allenati su forza esplosiva, coordinazione, postura, salute cardiovascolare — adatto a ogni livello e a ogni età.",
    bodyEn:
      "Suspension, circuit, personal training, group classes, stretching, pilates, postural training, rehabilitation, physical therapy, athletic prep. Train explosive strength, coordination, posture, cardiovascular health — for every level, every age.",
  },
  {
    eyebrowIt: "L'ACADEMY",
    eyebrowEn: "THE ACADEMY",
    titleIt: "Revoring Academy — formazione continua.",
    titleEn: "Revoring Academy — continuous education.",
    bodyIt:
      "L'Academy sviluppa costantemente soluzioni di allenamento in più discipline del benessere: functional training, fisioterapia, pilates miofasciale, arti marziali. Metodologia scientifica, team di esperti, direzione tecnica certificata.",
    bodyEn:
      "The Academy continuously develops training solutions across multiple wellness disciplines: functional training, physical therapy, myofascial pilates, martial arts. Scientific methodology, expert team, certified technical direction.",
  },
];

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isIt = locale === "it";

  let adminBody: string | null = null;
  try {
    const row = await store.findOne<Page>(TABLES.pages, (p) => p.key === "about");
    adminBody = row?.bodyI18n?.[locale as "it" | "en"] ?? null;
  } catch {
    adminBody = null;
  }

  return (
    <>
      <section className="relative h-[60vh] min-h-[480px] overflow-hidden bg-neutral-950 text-white">
        <Image
          src="/brand/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black" aria-hidden />
        <div className="relative container-x h-full flex flex-col justify-end pb-16">
          <p className="text-xs tracking-[0.3em] text-neutral-300">
            {isIt ? "CHI SIAMO" : "ABOUT"}
          </p>
          <h1 className="mt-4 text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] max-w-3xl">
            {isIt ? "Un solo attrezzo. Allenamenti infiniti." : "One tool. Infinite workouts."}
          </h1>
        </div>
      </section>

      {adminBody ? (
        <section className="container-x py-24 max-w-3xl">
          <div
            className="prose prose-neutral max-w-none"
            dangerouslySetInnerHTML={{ __html: adminBody }}
          />
        </section>
      ) : (
        <>
          {BLOCKS.map((b, i) => (
            <section key={b.eyebrowEn} className={i % 2 === 0 ? "bg-white" : "bg-neutral-50"}>
              <div className="container-x py-24 md:py-32 grid gap-12 md:grid-cols-[1fr_2fr] items-start">
                <div>
                  <p className="text-xs tracking-[0.3em] text-[color:var(--color-brand)]">
                    {isIt ? b.eyebrowIt : b.eyebrowEn}
                  </p>
                  <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
                    {isIt ? b.titleIt : b.titleEn}
                  </h2>
                </div>
                <p className="text-lg leading-relaxed text-neutral-700">
                  {isIt ? b.bodyIt : b.bodyEn}
                </p>
              </div>
            </section>
          ))}

          <section className="bg-neutral-100">
            <div className="container-x py-16">
              <div className="aspect-[16/9] relative rounded-lg overflow-hidden">
                <Image
                  src="/brand/about.png"
                  alt={isIt ? "Sessione di allenamento Revoring" : "Revoring training session"}
                  fill
                  sizes="(min-width: 1024px) 80rem, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </section>

          <section className="border-y border-neutral-200 bg-white">
            <div className="container-x py-20 grid grid-cols-2 md:grid-cols-4 gap-8">
              <Stat n="300+" labelIt="Esercizi" labelEn="Exercises" isIt={isIt} />
              <Stat n="14" labelIt="Anelli elastici" labelEn="Elastic rings" isIt={isIt} />
              <Stat n="3" labelIt="Livelli di resistenza" labelEn="Resistance levels" isIt={isIt} />
              <Stat n="30+" labelIt="Paesi" labelEn="Countries" isIt={isIt} />
            </div>
          </section>

          <section className="bg-neutral-950 text-white">
            <div className="container-x py-24 md:py-32 max-w-3xl">
              <p className="text-xs tracking-[0.3em] text-neutral-400">
                {isIt ? "L'AZIENDA" : "THE COMPANY"}
              </p>
              <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">
                Tecnocomponent SRL
              </h2>
              <dl className="mt-10 grid sm:grid-cols-2 gap-x-12 gap-y-6 text-sm">
                <Item label={isIt ? "Sede" : "Address"} value="Via Fossalta, 3895 — 47522 Cesena (FC), Italia" />
                <Item label="P.IVA" value="03301570408" />
                <Item label="REA" value="FO394793" />
                <Item
                  label="Email"
                  value={
                    <a href="mailto:info@revoring.com" className="underline underline-offset-4">
                      info@revoring.com
                    </a>
                  }
                />
              </dl>
            </div>
          </section>
        </>
      )}
    </>
  );
}

function Stat({
  n,
  labelIt,
  labelEn,
  isIt,
}: {
  n: string;
  labelIt: string;
  labelEn: string;
  isIt: boolean;
}) {
  return (
    <div>
      <p className="text-5xl md:text-6xl font-semibold tracking-tight">{n}</p>
      <p className="mt-2 text-sm text-neutral-500 uppercase tracking-wider">
        {isIt ? labelIt : labelEn}
      </p>
    </div>
  );
}

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-neutral-500 text-xs uppercase tracking-wider">{label}</dt>
      <dd className="mt-1 text-base">{value}</dd>
    </div>
  );
}
