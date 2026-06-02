"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { SmoothScroll } from "./SmoothScroll";

function splitWords(s: string): string[] {
  return s.split(" ");
}

export function Hero() {
  const t = useTranslations("home");
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 220]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduceMotion ? 1 : 1.12]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -80]);

  const titleWords = splitWords(t("heroTitle"));

  return (
    <>
      <SmoothScroll />
      <section
        ref={ref}
        className="relative h-[100svh] overflow-hidden bg-neutral-950 text-white"
      >
        {/* Background image with parallax + slow ken-burns */}
        <motion.div style={{ scale }} className="absolute inset-0">
          <motion.div
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src="/brand/hero.jpg"
              alt="Allenamento Revoring"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_30%]"
            />
          </motion.div>
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.25)_45%,rgba(0,0,0,0.85)_100%)]"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_18%_40%,rgba(255,90,60,0.18),transparent_55%)]"
            aria-hidden
          />
        </motion.div>

        {/* Foreground content */}
        <motion.div
          style={{ y, opacity }}
          className="relative z-10 container-x h-full flex flex-col justify-end pb-24 md:pb-28"
        >
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-xs tracking-[0.4em] text-neutral-300"
          >
            {t("heroEyebrow")}
          </motion.p>

          <motion.h1
            style={{ y: titleY }}
            initial="initial"
            animate="enter"
            variants={{ enter: { transition: { staggerChildren: 0.06, delayChildren: 0.45 } } }}
            className="mt-6 max-w-5xl text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[0.95]"
          >
            {titleWords.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden align-bottom mr-3 last:mr-0">
                <motion.span
                  className="inline-block"
                  variants={{
                    initial: { y: "115%", opacity: 0 },
                    enter: { y: 0, opacity: 1, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
                  }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.95 }}
            className="mt-6 max-w-xl text-lg md:text-xl text-neutral-200"
          >
            {t("heroSubtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <Button asChild variant="brand" size="lg">
              <Link href={`/${locale}/catalogue`}>{t("heroCtaPrimary")}</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href={`/${locale}/about`}>{t("heroCtaSecondary")}</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[10px] tracking-[0.4em] text-neutral-400"
        >
          <span>SCROLL</span>
          <motion.span
            aria-hidden
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="block h-6 w-px bg-neutral-400/60"
          />
        </motion.div>
      </section>
    </>
  );
}
