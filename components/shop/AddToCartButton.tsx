"use client";

import { useTransition, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { addToCartAction } from "@/app/actions/cart";

export function AddToCartButton({ variantId, disabled }: { variantId: string; disabled?: boolean }) {
  const t = useTranslations("common");
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();
  return (
    <form
      action={(fd) => {
        fd.set("variantId", variantId);
        startTransition(async () => {
          await addToCartAction(fd);
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        });
      }}
    >
      <Button type="submit" variant="brand" size="lg" disabled={disabled || pending}>
        {added ? "✓" : t("shopNow")}
      </Button>
    </form>
  );
}
