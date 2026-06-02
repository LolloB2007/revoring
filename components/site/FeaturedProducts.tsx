"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";

/**
 * Marketing-side featured products. Reads from the DB-backed catalogue in
 * the future; right now uses curated entries with real product photos pulled
 * from the existing revoring.com site so the homepage isn't empty on first
 * deploy.
 */
const FEATURED = [
  {
    slug: "revoring-classic",
    nameIt: "Revoring Classic",
    nameEn: "Revoring Classic",
    subIt: "Il sistema originale",
    subEn: "The original system",
    image: "/brand/product-revoring.jpg",
  },
  {
    slug: "revoring-pro",
    nameIt: "Revoring Pro",
    nameEn: "Revoring Pro",
    subIt: "Resistenza avanzata",
    subEn: "Advanced resistance",
    image: "/brand/product-pro.jpg",
  },
  {
    slug: "revoring-light",
    nameIt: "Revoring Light",
    nameEn: "Revoring Light",
    subIt: "Inizia da qui",
    subEn: "Start here",
    image: "/brand/product-light.jpg",
  },
] as const;

export function FeaturedProducts() {
  const locale = useLocale();
  const t = useTranslations("home");
  const isIt = locale === "it";
  return (
    <section className="py-24 md:py-32 bg-neutral-50">
      <div className="container-x">
        <div className="flex items-end justify-between mb-12">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-xl">
            {isIt ? "Tre configurazioni. Un solo principio." : "Three configurations. One principle."}
          </h2>
          <Link
            href={`/${locale}/catalogue`}
            className="hidden md:inline text-sm underline-offset-4 hover:underline"
          >
            {t("heroCtaPrimary")} →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURED.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={`/${locale}/catalogue/${p.slug}`} className="group block">
                <div className="aspect-square overflow-hidden rounded-lg bg-white relative">
                  <Image
                    src={p.image}
                    alt={isIt ? p.nameIt : p.nameEn}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <h3 className="font-medium tracking-tight">{isIt ? p.nameIt : p.nameEn}</h3>
                    <p className="text-sm text-neutral-500">{isIt ? p.subIt : p.subEn}</p>
                  </div>
                  <span className="text-sm text-neutral-400 group-hover:text-neutral-900 transition">
                    →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
