"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

export function CheckoutButton({ locale }: { locale: "it" | "en" }) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <>
      <Button
        variant="brand"
        size="lg"
        className="w-full mt-6"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setErr(null);
            const res = await fetch("/api/checkout", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ locale }),
            });
            if (!res.ok) {
              setErr(locale === "it" ? "Errore durante il checkout" : "Checkout error");
              return;
            }
            const { url } = await res.json();
            if (url) window.location.href = url;
          })
        }
      >
        {locale === "it" ? "Procedi al pagamento" : "Checkout"}
      </Button>
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
    </>
  );
}
