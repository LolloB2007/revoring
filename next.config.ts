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
  // jsdom (pulled in by isomorphic-dompurify for server-side sanitization) has
  // a transitive CJS/ESM mismatch that Turbopack can't bundle. Marking these
  // packages external makes Next require them at runtime from node_modules,
  // sidestepping the bundler entirely.
  serverExternalPackages: [
    "isomorphic-dompurify",
    "jsdom",
    "html-encoding-sniffer",
    "@exodus/bytes",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  images: {
    // Allow Vercel Blob (primary image host) and an optional R2 host.
    // picomatch (used by Next's image config validator) throws "Expected a
    // non-empty string" on an empty hostname, so we filter empties.
    remotePatterns: (() => {
      const patterns: Array<{ protocol: "https"; hostname: string }> = [
        { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      ];
      const r2 = (process.env.REVORING_R2_PUBLIC_HOST ?? "").trim();
      if (r2) patterns.push({ protocol: "https", hostname: r2 });
      return patterns;
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
