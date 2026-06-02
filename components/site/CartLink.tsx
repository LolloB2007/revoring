import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { Locale } from "@/i18n";

export function CartLink({ locale }: { locale: Locale }) {
  return (
    <Link
      href={`/${locale}/cart`}
      aria-label="Cart"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100"
    >
      <ShoppingBag className="h-5 w-5" />
    </Link>
  );
}
