"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n";

export function ContactForm({ locale }: { locale: Locale }) {
  const t = useTranslations("contacts");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name, email, message, locale }),
          });
          if (res.ok) setSent(true);
          else if (res.status === 429) setError(t("send"));
          else setError(t("send"));
        });
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm mb-1">{t("name")}</label>
        <Input required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm mb-1">{t("email")}</label>
        <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm mb-1">{t("message")}</label>
        <textarea
          required
          minLength={10}
          maxLength={4000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full min-h-40 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20"
        />
      </div>
      <Button type="submit" disabled={pending || sent}>{sent ? t("thanks") : t("send")}</Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
