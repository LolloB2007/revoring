"use client";

import { motion } from "motion/react";
import { useLocale } from "next-intl";

export function Testimonial() {
  const isIt = useLocale() === "it";
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="container-x max-w-4xl">
        <motion.figure
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <svg
            width="40"
            height="32"
            viewBox="0 0 40 32"
            className="text-[color:var(--color-brand)]"
            aria-hidden
          >
            <path
              fill="currentColor"
              d="M0 32V20q0-8 4-14T16 0v6q-6 2-8 6t-2 8h6v12H0Zm22 0V20q0-8 4-14T38 0v6q-6 2-8 6t-2 8h6v12H22Z"
            />
          </svg>
          <blockquote className="mt-6 text-2xl md:text-3xl font-medium tracking-tight leading-snug">
            {isIt
              ? "«In palestra, a casa, in viaggio. Lo uso ogni giorno — è l'attrezzo più versatile che ho mai avuto in mano.»"
              : "“At the gym, at home, on the road. I use it every day — the most versatile tool I've ever held.”"}
          </blockquote>
          <figcaption className="mt-6 text-sm text-neutral-500">
            — {isIt ? "Atleta certificato Revoring Academy" : "Certified Revoring Academy athlete"}
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
