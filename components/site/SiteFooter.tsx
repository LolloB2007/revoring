import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n";
import { NewsletterForm } from "./NewsletterForm";

export async function SiteFooter({ locale }: { locale: Locale }) {
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tFoot = await getTranslations({ locale, namespace: "footer" });
  const tCookies = await getTranslations({ locale, namespace: "cookies" });
  const base = `/${locale}`;
  const isIt = locale === "it";
  return (
    <footer className="border-t border-neutral-200 bg-neutral-950 text-neutral-100">
      <div className="container-x py-16 grid gap-12 md:grid-cols-4">
        <div>
          <p className="font-semibold tracking-tight text-xl">REVORING</p>
          <p className="mt-2 text-sm text-neutral-400">One Infinite Training</p>
          <address className="mt-6 not-italic text-sm text-neutral-400 leading-relaxed">
            Tecnocomponent SRL
            <br />
            Via Fossalta, 3895
            <br />
            47522 Cesena (FC), {isIt ? "Italia" : "Italy"}
            <br />
            <a href="mailto:info@revoring.com" className="hover:text-white">
              info@revoring.com
            </a>
          </address>
        </div>
        <div className="text-sm">
          <p className="font-medium mb-3">{isIt ? "Negozio" : "Shop"}</p>
          <ul className="space-y-2 text-neutral-400">
            <li><Link href={`${base}/catalogue`} className="hover:text-white">{tNav("catalogue")}</Link></li>
            <li><Link href={`${base}/about`} className="hover:text-white">{tNav("about")}</Link></li>
            <li><Link href={`${base}/blog`} className="hover:text-white">{tNav("blog")}</Link></li>
            <li><Link href={`${base}/contacts`} className="hover:text-white">{tNav("contacts")}</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-medium mb-3">{isIt ? "Legale" : "Legal"}</p>
          <ul className="space-y-2 text-neutral-400">
            <li><Link href={`${base}/legal/privacy`} className="hover:text-white">{tFoot("privacy")}</Link></li>
            <li><Link href={`${base}/legal/cookies`} className="hover:text-white">{tFoot("cookies")}</Link></li>
            <li><Link href={`${base}/legal/terms`} className="hover:text-white">{tFoot("terms")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-medium mb-3 text-sm">{tFoot("newsletter")}</p>
          <NewsletterForm locale={locale} />
        </div>
      </div>
      <div className="border-t border-neutral-800">
        <div className="container-x py-6 text-xs text-neutral-500 flex flex-wrap items-center gap-4 justify-between">
          <span>© {new Date().getFullYear()} Revoring · Tecnocomponent SRL · P.IVA 03301570408 · {tFoot("rights")}</span>
          <button
            type="button"
            data-open-cookie-prefs
            className="underline-offset-2 hover:underline hover:text-neutral-200"
          >
            {tCookies("manage")}
          </button>
        </div>
      </div>
    </footer>
  );
}
