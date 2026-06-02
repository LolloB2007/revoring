import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { Mail, MapPin, Building2 } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { ContactForm } from "@/components/site/ContactForm";
import type { Locale } from "@/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contacts" });
  return buildMetadata({
    locale: locale as Locale,
    path: "/contacts",
    title: t("title"),
    description:
      locale === "it"
        ? "Contatta Revoring — Tecnocomponent SRL, Cesena, Italia. info@revoring.com"
        : "Contact Revoring — Tecnocomponent SRL, Cesena, Italy. info@revoring.com",
  });
}

export default async function ContactsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contacts" });
  const isIt = locale === "it";

  return (
    <section className="container-x py-16 md:py-24">
      <header className="max-w-2xl">
        <p className="text-xs tracking-[0.3em] text-[color:var(--color-brand)]">
          {isIt ? "PARLA CON NOI" : "GET IN TOUCH"}
        </p>
        <h1 className="mt-4 text-5xl md:text-6xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-4 text-lg text-neutral-600">
          {isIt
            ? "Per ordini, supporto tecnico, corsi Academy, distribuzione e collaborazioni. Ti rispondiamo entro 24 ore lavorative."
            : "For orders, technical support, Academy courses, distribution and partnerships. We reply within 24 working hours."}
        </p>
      </header>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <ContactForm locale={locale as Locale} />

        <aside className="space-y-8">
          <Card>
            <Building2 className="h-5 w-5 text-[color:var(--color-brand)]" />
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-500">
                {isIt ? "Azienda" : "Company"}
              </p>
              <p className="mt-1 font-medium">Tecnocomponent SRL</p>
              <p className="text-sm text-neutral-600">P.IVA 03301570408 · REA FO394793</p>
            </div>
          </Card>
          <Card>
            <MapPin className="h-5 w-5 text-[color:var(--color-brand)]" />
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-500">
                {isIt ? "Sede" : "Address"}
              </p>
              <a
                href="https://maps.google.com/?q=Via+Fossalta+3895+Cesena"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block font-medium hover:underline underline-offset-4"
              >
                Via Fossalta, 3895
                <br />
                47522 Cesena (FC), {isIt ? "Italia" : "Italy"}
              </a>
            </div>
          </Card>
          <Card>
            <Mail className="h-5 w-5 text-[color:var(--color-brand)]" />
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-500">Email</p>
              <a
                href="mailto:info@revoring.com"
                className="mt-1 block font-medium hover:underline underline-offset-4"
              >
                info@revoring.com
              </a>
            </div>
          </Card>
          <div>
            <p className="text-xs uppercase tracking-wider text-neutral-500">
              {isIt ? "Seguici" : "Follow"}
            </p>
            <div className="mt-3 flex gap-3">
              <Social
                href="https://instagram.com/revoring_official/"
                label="Instagram"
                d="M12 2.2c3.2 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608C2.182 15.668 2.17 15.284 2.17 12s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311C8.416 2.212 8.8 2.2 12 2.2zm0 1.802c-3.15 0-3.523.012-4.768.069-.949.043-1.464.202-1.807.336-.454.176-.778.387-1.118.728-.341.34-.552.664-.728 1.118-.134.343-.293.858-.336 1.807-.057 1.245-.069 1.618-.069 4.768s.012 3.523.069 4.768c.043.949.202 1.464.336 1.807.176.454.387.778.728 1.118.34.341.664.552 1.118.728.343.134.858.293 1.807.336 1.245.057 1.618.069 4.768.069s3.523-.012 4.768-.069c.949-.043 1.464-.202 1.807-.336.454-.176.778-.387 1.118-.728.341-.34.552-.664.728-1.118.134-.343.293-.858.336-1.807.057-1.245.069-1.618.069-4.768s-.012-3.523-.069-4.768c-.043-.949-.202-1.464-.336-1.807a3.012 3.012 0 0 0-.728-1.118 3.012 3.012 0 0 0-1.118-.728c-.343-.134-.858-.293-1.807-.336-1.245-.057-1.618-.069-4.768-.069zm0 3.07a5.128 5.128 0 1 1 0 10.256 5.128 5.128 0 0 1 0-10.256zm0 8.456a3.328 3.328 0 1 0 0-6.656 3.328 3.328 0 0 0 0 6.656zm5.338-9.873a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"
              />
              <Social
                href="https://facebook.com/Revoring/"
                label="Facebook"
                d="M13.5 21.5v-8.25h2.77l.41-3.22H13.5V8.075c0-.93.26-1.563 1.594-1.563h1.7V3.633c-.294-.04-1.302-.127-2.475-.127-2.448 0-4.124 1.495-4.124 4.24v2.284H7.43v3.22h2.764V21.5h3.305z"
              />
              <Social
                href="https://youtube.com/channel/UCJlTe0TLFvQ1YT9rRL0DW5Q"
                label="YouTube"
                d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.546 15.568V8.432L15.818 12l-6.273 3.568z"
              />
            </div>
          </div>
        </aside>
      </div>

      <a
        href="https://www.google.com/maps/search/?api=1&query=Via+Fossalta+3895+47522+Cesena+FC+Italy"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-20 group block rounded-lg overflow-hidden border border-neutral-200 bg-neutral-950 text-neutral-100 hover:border-neutral-400 transition"
        aria-label={isIt ? "Apri la mappa in Google Maps" : "Open the map in Google Maps"}
      >
        <div className="relative h-72 bg-[radial-gradient(circle_at_50%_50%,rgba(255,90,60,0.18),transparent_60%),linear-gradient(180deg,#0e1216,#0a0a0c)] overflow-hidden">
          <svg
            aria-hidden
            className="absolute inset-0 w-full h-full text-neutral-700"
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 800 360"
          >
            {Array.from({ length: 14 }).map((_, i) => (
              <line key={`h${i}`} x1="0" x2="800" y1={i * 26 + 8} y2={i * 26 + 8} stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.6" />
            ))}
            {Array.from({ length: 28 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 30 + 4} x2={i * 30 + 4} y1="0" y2="360" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.6" />
            ))}
            <path
              d="M 60 280 Q 200 260 320 200 T 600 110 L 740 70"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="400" cy="180" r="10" fill="var(--color-brand,#ff5a3c)" />
            <circle cx="400" cy="180" r="22" fill="none" stroke="var(--color-brand,#ff5a3c)" strokeOpacity="0.4" strokeWidth="2" />
          </svg>
          <div className="relative h-full flex flex-col justify-end p-8">
            <p className="text-xs tracking-[0.3em] text-neutral-400">
              {isIt ? "DOVE SIAMO" : "FIND US"}
            </p>
            <p className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
              Via Fossalta, 3895 · Cesena (FC), Italia
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm text-neutral-300 group-hover:text-white transition">
              {isIt ? "Apri in Google Maps" : "Open in Google Maps"} →
            </span>
          </div>
        </div>
      </a>
    </section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-neutral-200 bg-white p-5">
      {children}
    </div>
  );
}

function Social({ href, label, d }: { href: string; label: string; d: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d={d} />
      </svg>
    </Link>
  );
}
