import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Revoring", template: "%s · Revoring" },
  description: "One tool. Infinite workouts.",
};

/**
 * Root layout is intentionally minimal — locale-aware <html lang> and the
 * NextIntlClientProvider live in app/[locale]/layout.tsx. The /admin tree
 * uses its own layout below this one.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement;
}
