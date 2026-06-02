"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useLocale } from "next-intl";

const SHOTS = [
  {
    src: "/brand/lifestyle-1.jpg",
    altIt: "Sessione di gruppo Revoring",
    altEn: "Revoring group session",
  },
  {
    src: "/brand/lifestyle-2.jpg",
    altIt: "Personal training con Revoring",
    altEn: "Personal training with Revoring",
  },
  {
    src: "/brand/lifestyle-3.jpg",
    altIt: "Allenamento intenso con Revoring",
    altEn: "Intense Revoring workout",
  },
];

export function InAction() {
  const isIt = useLocale() === "it";
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const y3 = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);
  const parallax = [y1, y2, y3];

  return (
    <section ref={ref} className="py-24 md:py-32 bg-white">
      <div className="container-x">
        <div className="max-w-2xl mb-12">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="text-xs tracking-[0.3em] text-[color:var(--color-brand)]"
          >
            {isIt ? "REVORING IN AZIONE" : "REVORING IN ACTION"}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight"
          >
            {isIt ? "Un attrezzo. Mille modi di allenarsi." : "One tool. A thousand ways to train."}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-4 text-neutral-600 leading-relaxed"
          >
            {isIt
              ? "Da soli, con un partner, in classe — la catena di 14 anelli si adatta a ogni contesto."
              : "Solo, with a partner, in class — the 14-ring chain fits any context."}
          </motion.p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {SHOTS.map((s, i) => (
            <motion.div
              key={s.src}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              style={{ y: parallax[i] }}
              className="relative aspect-[3/4] overflow-hidden rounded-lg bg-neutral-100"
            >
              <Image
                src={s.src}
                alt={isIt ? s.altIt : s.altEn}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-700 hover:scale-[1.05]"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
