"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

/**
 * About-page hero with three layered motion effects:
 *  - Ken Burns slow zoom on the background image
 *  - Scroll-driven Y parallax on the headline
 *  - Word-by-word reveal of the title
 */
export function AboutHero({ eyebrow, title }: { eyebrow: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  const words = title.split(" ");

  return (
    <section
      ref={ref}
      className="relative h-[70vh] min-h-[520px] overflow-hidden bg-neutral-950 text-white"
    >
      <motion.div
        style={reduce ? undefined : { scale: bgScale }}
        className="absolute inset-0"
        // Ken-Burns: also gently animate on mount so it's alive even without scroll
      >
        <motion.div
          initial={{ scale: 1 }}
          animate={reduce ? undefined : { scale: 1.06 }}
          transition={{ duration: 18, ease: "linear" }}
          className="absolute inset-0"
        >
          <Image
            src="/brand/hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60"
            aria-hidden
          />
        </motion.div>
      </motion.div>
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black"
        aria-hidden
      />
      <motion.div
        style={reduce ? undefined : { y: textY, opacity: textOpacity }}
        className="relative container-x h-full flex flex-col justify-end pb-16"
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs tracking-[0.3em] text-neutral-300"
        >
          {eyebrow}
        </motion.p>
        <h1 className="mt-4 text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] max-w-3xl">
          {words.map((w, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 60, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.15 + i * 0.07,
              }}
              className="inline-block mr-[0.22em]"
            >
              {w}
            </motion.span>
          ))}
        </h1>
      </motion.div>
    </section>
  );
}
