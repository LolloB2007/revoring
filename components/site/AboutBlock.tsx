"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

interface Props {
  numero: string;
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  reverse: boolean;
  bg: "white" | "neutral";
}

/**
 * One About-page editorial block — image / text split with:
 *  - Numbered eyebrow (01/02/03) that translates + fades in
 *  - Title revealed word-by-word
 *  - Body fades + lifts
 *  - Image scrubs a subtle scroll-driven scale + parallax-Y
 *  - Hover scale on the image
 */
export function AboutBlock({
  numero,
  eyebrow,
  title,
  body,
  image,
  imageAlt,
  reverse,
  bg,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1.04]);
  const numScale = useTransform(scrollYProgress, [0, 0.4], [1.2, 1]);

  const words = title.split(" ");

  return (
    <section
      ref={ref}
      className={`${bg === "white" ? "bg-white" : "bg-neutral-50"} border-t border-neutral-900/90`}
    >
      <div
        className={`container-x py-20 md:py-28 grid gap-10 md:gap-16 items-center md:grid-cols-2 ${
          reverse ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div className="space-y-6">
          <motion.div
            className="flex items-baseline gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.span
              style={reduce ? undefined : { scale: numScale }}
              className="text-5xl md:text-7xl font-semibold tracking-tight text-neutral-200 leading-none origin-bottom-left"
            >
              {numero}
            </motion.span>
            <span className="text-xs tracking-[0.3em] text-[color:var(--color-brand)]">
              {eyebrow}
            </span>
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
            {words.map((w, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.08 + i * 0.05,
                }}
                className="inline-block mr-[0.25em]"
              >
                {w}
              </motion.span>
            ))}
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg leading-relaxed text-neutral-700 max-w-xl"
          >
            {body}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-[4/5] md:aspect-[5/6] overflow-hidden rounded-lg bg-neutral-100"
        >
          <motion.div
            style={reduce ? undefined : { y: imageY, scale: imageScale }}
            className="absolute inset-0"
          >
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 hover:scale-[1.04]"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
