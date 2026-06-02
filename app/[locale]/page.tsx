import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/hero/Hero";
import { Marquee } from "@/components/site/Marquee";
import { ValueProps } from "@/components/site/ValueProps";
import { FeaturedProducts } from "@/components/site/FeaturedProducts";
import { InAction } from "@/components/site/InAction";
import { SocialProof } from "@/components/site/SocialProof";
import { AcademyBanner } from "@/components/site/AcademyBanner";
import { Testimonial } from "@/components/site/Testimonial";
import { CtaBanner } from "@/components/site/CtaBanner";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return buildMetadata({
    locale: locale as Locale,
    path: "",
    title: t("heroTitle"),
    description: t("heroSubtitle"),
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <Marquee />
      <ValueProps />
      <SocialProof />
      <FeaturedProducts />
      <InAction />
      <Testimonial />
      <AcademyBanner />
      <CtaBanner />
    </>
  );
}
