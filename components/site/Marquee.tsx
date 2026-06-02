"use client";

import { motion } from "motion/react";
import { useLocale } from "next-intl";

const ITEMS = {
  it: [
    "ONE INFINITE TRAINING",
    "14 ANELLI ELASTICI",
    "300+ ESERCIZI",
    "3 INTENSITÀ",
    "ALL IN ONE",
    "MADE IN CESENA · ITALIA",
    "SUSPENSION TRAINING",
    "PILATES MIOFASCIALE",
  ],
  en: [
    "ONE INFINITE TRAINING",
    "14 ELASTIC RINGS",
    "300+ EXERCISES",
    "3 INTENSITIES",
    "ALL IN ONE",
    "MADE IN CESENA · ITALY",
    "SUSPENSION TRAINING",
    "MYOFASCIAL PILATES",
  ],
} as const;

export function Marquee() {
  const locale = useLocale() === "it" ? "it" : "en";
  const items = ITEMS[locale];
  const row = [...items, ...items];
  return (
    <section className="border-y border-neutral-200 bg-neutral-950 text-white overflow-hidden">
      <div className="relative py-6">
        <motion.div
          className="flex gap-12 whitespace-nowrap will-change-transform"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 28, ease: "linear", repeat: Infinity }}
        >
          {row.map((label, i) => (
            <span
              key={`${label}-${i}`}
              className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-12"
            >
              {label}
              <Dot />
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Dot() {
  return (
    <span
      aria-hidden
      className="inline-block h-2 w-2 rounded-full bg-[color:var(--color-brand)]"
    />
  );
}
