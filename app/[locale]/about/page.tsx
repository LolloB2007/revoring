import { setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { AboutHero } from "@/components/site/AboutHero";
import { AboutBlock } from "@/components/site/AboutBlock";
import { AboutInterstitial } from "@/components/site/AboutInterstitial";
import { MarqueeStrip } from "@/components/site/MarqueeStrip";
import { AboutStats } from "@/components/site/AboutStats";
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
  numero: string;
  eyebrowIt: string;
  eyebrowEn: string;
  titleIt: string;
  titleEn: string;
  bodyIt: string;
  bodyEn: string;
  image: string;
  imageAltIt: string;
  imageAltEn: string;
}

const BLOCKS: Block[] = [
  {
    numero: "01",
    eyebrowIt: "IL PRODOTTO",
    eyebrowEn: "THE PRODUCT",
    titleIt: "Una catena di 14 anelli elastici. Infinite impugnature.",
    titleEn: "A chain of 14 elastic rings. Infinite grips.",
    bodyIt:
      "Revoring® è il primo attrezzo di fitness all-in-one: una catena di 14 anelli elastici con molteplici impugnature. Permette di regolare l'intensità di ogni esercizio e di trovare punti di ancoraggio diversi — a casa, in palestra, all'aperto.",
    bodyEn:
      "Revoring® is the first all-in-one fitness tool: a 14-ring elastic chain with multiple grips. Adjust the intensity of every exercise and find different anchoring points — at home, in the gym, outdoors.",
    image: "/brand/product-medium.jpg",
    imageAltIt: "Catena di 14 anelli elastici Revoring",
    imageAltEn: "Revoring 14-ring elastic chain",
  },
  {
    numero: "02",
    eyebrowIt: "LA METODOLOGIA",
    eyebrowEn: "THE METHOD",
    titleIt: "Il sistema più versatile per l'allenamento funzionale.",
    titleEn: "The most versatile functional training system.",
    bodyIt:
      "Suspension, circuit, personal training, gruppi, stretching, pilates, allenamento posturale, riabilitazione, fisioterapia, preparazione atletica. Allenati su forza esplosiva, coordinazione, postura, salute cardiovascolare — adatto a ogni livello e a ogni età.",
    bodyEn:
      "Suspension, circuit, personal training, group classes, stretching, pilates, postural training, rehabilitation, physical therapy, athletic prep. Train explosive strength, coordination, posture, cardiovascular health — for every level, every age.",
    image: "/brand/lifestyle-1.jpg",
    imageAltIt: "Sessione di allenamento Revoring",
    imageAltEn: "Revoring training session",
  },
  {
    numero: "03",
    eyebrowIt: "L'ACADEMY",
    eyebrowEn: "THE ACADEMY",
    titleIt: "Revoring Academy — formazione continua.",
    titleEn: "Revoring Academy — continuous education.",
    bodyIt:
      "L'Academy sviluppa costantemente soluzioni di allenamento in più discipline del benessere: functional training, fisioterapia, pilates miofasciale, arti marziali. Metodologia scientifica, team di esperti, direzione tecnica certificata.",
    bodyEn:
      "The Academy continuously develops training solutions across multiple wellness disciplines: functional training, physical therapy, myofascial pilates, martial arts. Scientific methodology, expert team, certified technical direction.",
    image: "/brand/academy.jpg",
    imageAltIt: "Corso Revoring Academy",
    imageAltEn: "Revoring Academy course",
  },
];

const MARQUEE_IT = [
  "ONE INFINITE TRAINING",
  "14 ANELLI",
  "3 INTENSITÀ",
  "MADE IN ITALY",
  "300+ ESERCIZI",
  "ACADEMY CERTIFICATA",
];
const MARQUEE_EN = [
  "ONE INFINITE TRAINING",
  "14 RINGS",
  "3 INTENSITIES",
  "MADE IN ITALY",
  "300+ EXERCISES",
  "CERTIFIED ACADEMY",
];

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isIt = locale === "it";

  return (
    <>
      <AboutHero
        eyebrow={isIt ? "CHI SIAMO" : "ABOUT"}
        title={isIt ? "Un solo attrezzo. Allenamenti infiniti." : "One tool. Infinite workouts."}
      />

      {BLOCKS.map((b, i) => (
        <AboutBlock
          key={b.eyebrowEn}
          numero={b.numero}
          eyebrow={isIt ? b.eyebrowIt : b.eyebrowEn}
          title={isIt ? b.titleIt : b.titleEn}
          body={isIt ? b.bodyIt : b.bodyEn}
          image={b.image}
          imageAlt={isIt ? b.imageAltIt : b.imageAltEn}
          reverse={i % 2 === 1}
          bg={i % 2 === 0 ? "white" : "neutral"}
        />
      ))}

      <MarqueeStrip items={isIt ? MARQUEE_IT : MARQUEE_EN} />

      <AboutInterstitial
        text={isIt ? "Allenati ovunque. Ottieni risultati come in palestra." : "Train anywhere. Get gym-grade results."}
      />

      <AboutStats isIt={isIt} />

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
