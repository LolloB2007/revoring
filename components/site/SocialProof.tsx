"use client";

import { motion } from "motion/react";
import { useLocale } from "next-intl";

const STATS = [
  { value: "300+", labelIt: "Esercizi", labelEn: "Exercises" },
  { value: "12k", labelIt: "Atleti", labelEn: "Athletes" },
  { value: "180+", labelIt: "Istruttori certificati", labelEn: "Certified instructors" },
  { value: "30+", labelIt: "Paesi", labelEn: "Countries" },
];

export function SocialProof() {
  const isIt = useLocale() === "it";
  return (
    <section className="py-20 border-y border-neutral-200 bg-white">
      <div className="container-x grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((s, i) => (
          <motion.div
            key={s.value}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="text-center md:text-left"
          >
            <p className="text-5xl md:text-6xl font-semibold tracking-tight">{s.value}</p>
            <p className="mt-2 text-sm text-neutral-500 uppercase tracking-wider">
              {isIt ? s.labelIt : s.labelEn}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
