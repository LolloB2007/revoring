import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const projectRoot = dirname(fileURLToPath(import.meta.url));
// next-intl requires a relative path here.
const withNextIntl = createNextIntlPlugin("./i18n.ts");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(self \"https://js.stripe.com\"), usb=()",
  },
  // CSP is generated per-request in middleware.ts (nonce-based).
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: projectRoot,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  images: {
    // Only register the R2 remote pattern when the hostname env var is a
    // non-empty string; picomatch (used by Next's image config validator)
    // throws "Expected a non-empty string" on an empty hostname.
    remotePatterns: (() => {
      const host = (process.env.REVORING_R2_PUBLIC_HOST ?? "").trim();
      return host ? [{ protocol: "https" as const, hostname: host }] : [];
    })(),
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
