"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";

export function AcademyBanner() {
  const locale = useLocale();
  const isIt = locale === "it";
  return (
    <section className="py-24 md:py-32 bg-neutral-950 text-white overflow-hidden">
      <div className="container-x grid gap-12 lg:grid-cols-2 items-center">
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs tracking-[0.3em] text-neutral-400">REVORING ACADEMY</p>
          <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
            {isIt
              ? "Diventa istruttore certificato Revoring."
              : "Become a certified Revoring instructor."}
          </h2>
          <p className="mt-6 max-w-md text-neutral-300 leading-relaxed">
            {isIt
              ? "Corsi accreditati per personal trainer e professionisti del fitness. Metodologia, biomeccanica, programmazione."
              : "Accredited courses for personal trainers and fitness professionals. Methodology, biomechanics, programming."}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild variant="brand" size="lg">
              <Link href={`/${locale}/about`}>{isIt ? "Scopri l'Academy" : "Discover the Academy"}</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href={`/${locale}/contacts`}>{isIt ? "Parla con noi" : "Talk to us"}</Link>
            </Button>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="aspect-[4/3] relative rounded-xl overflow-hidden"
        >
          <Image
            src="/brand/academy.jpg"
            alt={isIt ? "Sessione Revoring Academy" : "Revoring Academy session"}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
