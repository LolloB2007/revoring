"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n";

export function NewsletterForm({ locale }: { locale: Locale }) {
  const t = useTranslations("newsletter");
  const tFooter = useTranslations("footer");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await fetch("/api/newsletter/subscribe", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email, locale }),
          });
          if (res.status === 429) setMsg(t("rateLimited"));
          else if (res.status === 200) {
            const data = await res.json();
            setMsg(data.alreadyConfirmed ? t("alreadySubscribed") : t("checkInbox"));
            setEmail("");
          } else setMsg(t("invalidEmail"));
        });
      }}
      className="space-y-2"
    >
      <div className="flex gap-2">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={tFooter("newsletterPlaceholder")}
          className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
        />
        <Button type="submit" variant="brand" size="md" disabled={pending}>
          {tFooter("newsletterCta")}
        </Button>
      </div>
      {msg && <p className="text-xs text-neutral-400">{msg}</p>}
    </form>
  );
}
