"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Infinity as InfinityIcon, Backpack, ShieldCheck } from "lucide-react";

const items = [
  { key: "modular", Icon: InfinityIcon },
  { key: "portable", Icon: Backpack },
  { key: "certified", Icon: ShieldCheck },
] as const;

export function ValueProps() {
  const t = useTranslations("home.valueProps");
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="container-x grid gap-12 md:grid-cols-3">
        {items.map(({ key, Icon }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex flex-col gap-4"
          >
            <Icon className="h-8 w-8 text-[color:var(--color-brand)]" />
            <h3 className="text-2xl font-semibold tracking-tight">{t(`${key}.title`)}</h3>
            <p className="text-neutral-600 leading-relaxed">{t(`${key}.body`)}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
