"use client";

import { useTransition } from "react";
import { setQtyAction } from "@/app/actions/cart";

export function QtyControl({ variantId, qty, max }: { variantId: string; qty: number; max: number }) {
  const [pending, startTransition] = useTransition();
  const set = (q: number) => {
    const fd = new FormData();
    fd.set("variantId", variantId);
    fd.set("qty", String(Math.max(0, Math.min(max, q))));
    startTransition(() => setQtyAction(fd));
  };
  return (
    <div className="inline-flex items-center rounded-md border border-neutral-300 bg-white">
      <button
        type="button"
        onClick={() => set(qty - 1)}
        disabled={pending || qty <= 0}
        aria-label="decrement"
        className="px-3 py-1 text-lg leading-none disabled:opacity-40"
      >
        −
      </button>
      <span className="px-3 text-sm tabular-nums" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => set(qty + 1)}
        disabled={pending || qty >= max}
        aria-label="increment"
        className="px-3 py-1 text-lg leading-none disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
