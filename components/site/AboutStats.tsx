"use client";

import { motion } from "motion/react";
import { CountUp } from "./CountUp";

const STATS = [
  { value: 300, suffix: "+", labelIt: "Esercizi", labelEn: "Exercises" },
  { value: 14, suffix: "", labelIt: "Anelli elastici", labelEn: "Elastic rings" },
  { value: 3, suffix: "", labelIt: "Livelli di resistenza", labelEn: "Resistance levels" },
  { value: 30, suffix: "+", labelIt: "Paesi", labelEn: "Countries" },
];

export function AboutStats({ isIt }: { isIt: boolean }) {
  return (
    <section className="border-y border-neutral-900/90 bg-white">
      <div className="container-x py-20 grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((s, i) => (
          <motion.div
            key={s.labelEn}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-5xl md:text-6xl font-semibold tracking-tight tabular-nums">
              <CountUp value={s.value} suffix={s.suffix} />
            </p>
            <p className="mt-2 text-sm text-neutral-500 uppercase tracking-wider">
              {isIt ? s.labelIt : s.labelEn}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
