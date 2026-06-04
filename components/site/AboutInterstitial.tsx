"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

/**
 * Full-bleed dark cinematic break between the editorial blocks and the
 * stats section. Background image gets parallax + scale; the tagline slides
 * in with a soft blur clear.
 */
export function AboutInterstitial({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.2]);

  return (
    <section
      ref={ref}
      className="relative h-72 md:h-[28rem] overflow-hidden bg-neutral-950"
    >
      <motion.div
        style={reduce ? undefined : { y: bgY, scale: bgScale }}
        className="absolute inset-0"
      >
        <Image
          src="/brand/lifestyle-2.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-50"
          aria-hidden
        />
      </motion.div>
      <div
        className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent"
        aria-hidden
      />
      <div className="relative container-x h-full flex items-center">
        <motion.p
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl md:text-5xl font-semibold tracking-tight text-white max-w-2xl leading-tight"
        >
          {text}
        </motion.p>
      </div>
    </section>
  );
}
