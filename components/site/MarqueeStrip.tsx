"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Infinite horizontal marquee of brand phrases. Two identical tracks chase
 * each other to create a seamless loop. Pure CSS would also work but Motion
 * gives us smooth pausing on reduced-motion.
 */
export function MarqueeStrip({
  items,
  speed = 40,
  className = "",
}: {
  items: string[];
  speed?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const track = (
    <div className="flex shrink-0 items-center gap-12 pr-12">
      {items.map((t, i) => (
        <span key={i} className="flex items-center gap-12">
          <span className="text-3xl md:text-5xl font-semibold tracking-tight whitespace-nowrap">
            {t}
          </span>
          <span aria-hidden className="h-2 w-2 rounded-full bg-[color:var(--color-brand)]" />
        </span>
      ))}
    </div>
  );

  return (
    <section className={`relative overflow-hidden border-y border-neutral-900/90 bg-neutral-950 text-white py-8 md:py-10 ${className}`}>
      <motion.div
        className="flex w-max"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={
          reduce
            ? undefined
            : { duration: speed, ease: "linear", repeat: Infinity }
        }
      >
        {track}
        {track}
      </motion.div>
    </section>
  );
}
