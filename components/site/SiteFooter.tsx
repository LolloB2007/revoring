import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n";
import { NewsletterForm } from "./NewsletterForm";

export async function SiteFooter({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const base = `/${locale}`;
  return (
    <footer className="border-t border-neutral-200 bg-neutral-950 text-neutral-100">
      <div className="container-x py-16 grid gap-12 md:grid-cols-4">
        <div>
          <p className="font-semibold tracking-tight text-xl">REVORING</p>
          <p className="mt-2 text-sm text-neutral-400">One Infinite Training</p>
        </div>
        <div className="text-sm">
          <p className="font-medium mb-3">Shop</p>
          <ul className="space-y-2 text-neutral-400">
            <li><Link href={`${base}/catalogue`}>Catalogo</Link></li>
            <li><Link href={`${base}/about`}>About</Link></li>
            <li><Link href={`${base}/blog`}>Blog</Link></li>
            <li><Link href={`${base}/contacts`}>Contacts</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-medium mb-3">Legal</p>
          <ul className="space-y-2 text-neutral-400">
            <li><Link href={`${base}/legal/privacy`}>{t("privacy")}</Link></li>
            <li><Link href={`${base}/legal/cookies`}>{t("cookies")}</Link></li>
            <li><Link href={`${base}/legal/terms`}>{t("terms")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-medium mb-3 text-sm">{t("newsletter")}</p>
          <NewsletterForm locale={locale} />
        </div>
      </div>
      <div className="border-t border-neutral-800">
        <div className="container-x py-6 text-xs text-neutral-500 flex justify-between">
          <span>© {new Date().getFullYear()} Revoring. {t("rights")}</span>
          <button
            type="button"
            data-open-cookie-prefs
            className="underline-offset-2 hover:underline"
          >
            {t("rights") /* placeholder */}
          </button>
        </div>
      </div>
    </footer>
  );
}
