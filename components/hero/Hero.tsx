"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { SmoothScroll } from "./SmoothScroll";

export function Hero() {
  const t = useTranslations("home");
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <>
      <SmoothScroll />
      <section
        ref={ref}
        className="relative h-[100svh] overflow-hidden bg-neutral-950 text-white"
      >
        <motion.div style={{ scale }} className="absolute inset-0">
          <Image
            src="/brand/hero.jpg"
            alt="Functional elastic-ring training"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10"
            aria-hidden
          />
        </motion.div>
        <motion.div
          style={{ y, opacity }}
          className="relative z-10 container-x h-full flex flex-col justify-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs tracking-[0.3em] text-neutral-400"
          >
            {t("heroEyebrow")}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-6 max-w-4xl text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[1.02]"
          >
            {t("heroTitle")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-6 max-w-xl text-lg md:text-xl text-neutral-300"
          >
            {t("heroSubtitle")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs tracking-[0.3em] text-neutral-500"
        >
          SCROLL
        </motion.div>
      </section>
    </>
  );
}
