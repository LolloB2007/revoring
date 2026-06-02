import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n";
import { LanguageToggle } from "./LanguageToggle";
import { CartLink } from "./CartLink";

export async function SiteHeader({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "nav" });
  const base = `/${locale}`;
  const links = [
    { href: `${base}/catalogue`, label: t("catalogue") },
    { href: `${base}/about`, label: t("about") },
    { href: `${base}/blog`, label: t("blog") },
    { href: `${base}/contacts`, label: t("contacts") },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-white/80 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <Link href={base} className="flex items-center" aria-label="Revoring home">
          <Image
            src="/brand/revoring-logo.png"
            alt="Revoring"
            width={150}
            height={32}
            priority
            className="h-8 w-auto"
          />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-[color:var(--color-brand)]">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageToggle currentLocale={locale} />
          <Link href={`${base}/account`} className="hidden md:inline-block text-sm">
            {t("account")}
          </Link>
          <CartLink locale={locale} />
        </div>
      </div>
    </header>
  );
}
