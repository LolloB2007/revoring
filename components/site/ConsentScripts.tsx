"use client";

import { useEffect } from "react";

/**
 * Loads analytics ONLY after the user has granted analytics consent. Listens
 * for the `revoring:consent-changed` event so toggles take effect without a
 * page reload.
 */
export function ConsentScripts() {
  useEffect(() => {
    const apply = (consent: { analytics?: boolean } | null) => {
      const ok = consent?.analytics === true;
      const tag = document.getElementById("plausible-tag") as HTMLScriptElement | null;
      const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
      if (ok && domain && !tag) {
        const s = document.createElement("script");
        s.id = "plausible-tag";
        s.defer = true;
        s.dataset.domain = domain;
        s.src = "https://plausible.io/js/script.js";
        document.head.appendChild(s);
      } else if (!ok && tag) {
        tag.remove();
      }
    };

    try {
      const raw = localStorage.getItem("revoring.consent.v1");
      apply(raw ? JSON.parse(raw) : null);
    } catch {
      // ignore
    }
    const handler = (e: Event) => apply((e as CustomEvent).detail);
    window.addEventListener("revoring:consent-changed", handler);
    return () => window.removeEventListener("revoring:consent-changed", handler);
  }, []);
  return null;
}
