"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n";
import { cn } from "@/lib/utils";

export function LanguageToggle({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname() ?? "/";
  // Strip leading /<locale> and replace.
  const stripped = pathname.replace(/^\/(it|en)(?=\/|$)/, "") || "/";
  return (
    <div className="flex items-center gap-1 text-xs">
      {locales.map((l) => (
        <Link
          key={l}
          href={`/${l}${stripped === "/" ? "" : stripped}`}
          className={cn(
            "px-2 py-1 rounded-md uppercase tracking-wide",
            l === currentLocale ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900",
          )}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}
