"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  const locale = useLocale();
  const isIt = locale === "it";
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <Image
        src="/brand/hero.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/60" aria-hidden />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="relative container-x text-center text-white max-w-3xl"
      >
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
          {isIt ? "Inizia oggi. Un attrezzo è abbastanza." : "Start today. One tool is enough."}
        </h2>
        <p className="mt-6 text-lg text-neutral-200">
          {isIt
            ? "Scegli il tuo Revoring e ricevi gratis l'accesso alla libreria di esercizi."
            : "Pick your Revoring and get free access to the exercise library."}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild variant="brand" size="lg">
            <Link href={`/${locale}/catalogue`}>
              {isIt ? "Scopri i prodotti" : "Browse products"}
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href={`/${locale}/about`}>{isIt ? "Come funziona" : "How it works"}</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
