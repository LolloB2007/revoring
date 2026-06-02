"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Consent = { necessary: true; analytics: boolean; marketing: boolean; ts: number };
const KEY = "revoring.consent.v1";

export function CookieBanner() {
  const t = useTranslations("cookies");
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) setOpen(true);
    } catch {
      setOpen(true);
    }
    const handler = () => setOpen(true);
    window.addEventListener("revoring:open-cookie-prefs", handler);
    document
      .querySelectorAll("[data-open-cookie-prefs]")
      .forEach((el) => el.addEventListener("click", handler));
    return () => {
      window.removeEventListener("revoring:open-cookie-prefs", handler);
    };
  }, []);

  const save = (consent: Consent) => {
    localStorage.setItem(KEY, JSON.stringify(consent));
    document.cookie = `cookie_consent=${encodeURIComponent(
      JSON.stringify(consent),
    )}; Path=/; Max-Age=15552000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    window.dispatchEvent(new CustomEvent("revoring:consent-changed", { detail: consent }));
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label={t("title")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white shadow-2xl"
    >
      <div className="container-x py-5 md:flex md:items-center md:justify-between gap-6">
        <div className="max-w-2xl">
          <p className="font-semibold">{t("title")}</p>
          <p className="text-sm text-neutral-600 mt-1">{t("description")}</p>
          {showDetails && (
            <div className="mt-4 grid gap-3 text-sm">
              <Row label={t("necessary")} desc={t("necessaryDesc")} checked disabled />
              <Row
                label={t("analytics")}
                desc={t("analyticsDesc")}
                checked={analytics}
                onChange={setAnalytics}
              />
              <Row
                label={t("marketing")}
                desc={t("marketingDesc")}
                checked={marketing}
                onChange={setMarketing}
              />
            </div>
          )}
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2 md:flex-col md:items-stretch md:w-64">
          <Button
            variant="primary"
            onClick={() =>
              save({ necessary: true, analytics: true, marketing: true, ts: Date.now() })
            }
          >
            {t("acceptAll")}
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              save({ necessary: true, analytics: false, marketing: false, ts: Date.now() })
            }
          >
            {t("rejectAll")}
          </Button>
          {showDetails ? (
            <Button
              variant="ghost"
              onClick={() =>
                save({ necessary: true, analytics, marketing, ts: Date.now() })
              }
            >
              {t("save")}
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setShowDetails(true)}>
              {t("manage")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  desc,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={cn("flex items-start gap-3 cursor-pointer", disabled && "opacity-70")}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 h-4 w-4"
      />
      <span>
        <span className="font-medium">{label}</span>
        <span className="block text-neutral-500">{desc}</span>
      </span>
    </label>
  );
}
