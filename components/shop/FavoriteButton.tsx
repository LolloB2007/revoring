"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFavoriteAction } from "@/app/actions/favorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  productId,
  initialFavorited,
}: {
  productId: string;
  initialFavorited: boolean;
}) {
  const [fav, setFav] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();
  return (
    <form
      action={(fd) => {
        fd.set("productId", productId);
        startTransition(async () => {
          const res = await toggleFavoriteAction(fd);
          if (res?.ok) setFav(!!res.favorited);
        });
      }}
    >
      <Button type="submit" variant="secondary" size="lg" disabled={pending} aria-pressed={fav}>
        <Heart className={cn("h-4 w-4", fav && "fill-red-500 text-red-500")} />
      </Button>
    </form>
  );
}
