"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useRef } from "react";

const FEATURED = [
  {
    slug: "revoring-lite",
    nameIt: "Revoring Lite",
    nameEn: "Revoring Lite",
    subIt: "Analitico · stretching · pilates",
    subEn: "Analytical · stretching · pilates",
    price: "€145",
    image: "/brand/product-lite.jpg",
  },
  {
    slug: "revoring-medium",
    nameIt: "Revoring Medium",
    nameEn: "Revoring Medium",
    subIt: "Il più versatile",
    subEn: "The most versatile",
    price: "€169",
    image: "/brand/product-medium.jpg",
  },
  {
    slug: "revoring-strong",
    nameIt: "Revoring Strong",
    nameEn: "Revoring Strong",
    subIt: "Sospensione · alta intensità",
    subEn: "Suspension · high intensity",
    price: "€205",
    image: "/brand/product-strong.jpg",
  },
] as const;

export function FeaturedProducts() {
  const locale = useLocale();
  const t = useTranslations("home");
  const isIt = locale === "it";
  return (
    <section className="py-24 md:py-32 bg-neutral-50">
      <div className="container-x">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-5xl font-semibold tracking-tight max-w-xl"
          >
            {isIt ? "Tre intensità. Un solo principio." : "Three intensities. One principle."}
          </motion.h2>
          <Link
            href={`/${locale}/catalogue`}
            className="text-sm underline-offset-4 hover:underline"
          >
            {t("heroCtaPrimary")} →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURED.map((p, i) => (
            <ProductCard key={p.slug} p={p} index={i} isIt={isIt} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({
  p,
  index,
  isIt,
  locale,
}: {
  p: (typeof FEATURED)[number];
  index: number;
  isIt: boolean;
  locale: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 });
  const rotateX = useTransform(sy, [-50, 50], [6, -6]);
  const rotateY = useTransform(sx, [-50, 50], [-6, 6]);

  function onMove(e: React.MouseEvent) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set(e.clientX - r.left - r.width / 2);
    y.set(e.clientY - r.top - r.height / 2);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        ref={ref}
        href={`/${locale}/catalogue/${p.slug}`}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="group block [perspective:1200px]"
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative aspect-square overflow-hidden rounded-lg bg-white"
        >
          <Image
            src={p.image}
            alt={isIt ? p.nameIt : p.nameEn}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.07]"
          />
          <motion.div
            aria-hidden
            initial={false}
            whileHover={{ opacity: 1 }}
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 bg-[radial-gradient(circle_at_var(--mx,50%)_var(--my,50%),rgba(255,255,255,0.15),transparent_55%)]"
          />
        </motion.div>
        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <h3 className="font-medium tracking-tight">{isIt ? p.nameIt : p.nameEn}</h3>
            <p className="text-sm text-neutral-500">{isIt ? p.subIt : p.subEn}</p>
          </div>
          <span className="text-sm font-medium text-neutral-900">{p.price}</span>
        </div>
      </Link>
    </motion.div>
  );
}
