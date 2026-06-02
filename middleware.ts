import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";

const intlMiddleware = createIntlMiddleware({
  locales: locales as unknown as string[],
  defaultLocale,
  localePrefix: "always",
});

/**
 * Build a strict, nonce-based CSP. Stripe is whitelisted because checkout uses
 * stripe.js. Plausible is whitelisted but only actually loaded after cookie
 * consent (the consent script lazy-injects the tag).
 */
function buildCsp(nonce: string): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      "https://js.stripe.com",
      "https://plausible.io",
    ],
    "style-src": ["'self'", "'unsafe-inline'"], // Tailwind injects styles at build; inline kept for now
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "font-src": ["'self'", "data:"],
    "connect-src": [
      "'self'",
      "https://api.stripe.com",
      "https://plausible.io",
      ...(process.env.R2_PUBLIC_HOST ? [`https://${process.env.R2_PUBLIC_HOST}`] : []),
    ],
    "frame-src": ["https://js.stripe.com", "https://hooks.stripe.com"],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'", "https://checkout.stripe.com"],
    "object-src": ["'none'"],
    "upgrade-insecure-requests": [],
  };
  return Object.entries(directives)
    .map(([k, v]) => (v.length ? `${k} ${v.join(" ")}` : k))
    .join("; ");
}

function ipInCidrList(ip: string, cidrs: string[]): boolean {
  // Minimal CIDR check. For production scale move to a library; this is fine for
  // an allowlist of a handful of office IPs.
  for (const cidr of cidrs) {
    const [range, bitsStr] = cidr.split("/");
    if (!range) continue;
    if (!bitsStr) {
      if (ip === range) return true;
      continue;
    }
    const bits = parseInt(bitsStr, 10);
    if (Number.isNaN(bits)) continue;
    const ipNum = ipToInt(ip);
    const rangeNum = ipToInt(range);
    if (ipNum === null || rangeNum === null) continue;
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    if ((ipNum & mask) === (rangeNum & mask)) return true;
  }
  return false;
}

function ipToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const o = parseInt(p, 10);
    if (Number.isNaN(o) || o < 0 || o > 255) return null;
    n = (n << 8) | o;
  }
  return n >>> 0;
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Admin gate — return 404 (not 403) so the surface is invisible.
  if (pathname.startsWith("/admin")) {
    const allowlist = (process.env.ADMIN_IP_ALLOWLIST ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (allowlist.length > 0) {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        "";
      if (!ip || !ipInCidrList(ip, allowlist)) {
        return new NextResponse("Not found", { status: 404 });
      }
    }
    // Actual auth + admin-email check happens in the /admin layout (RSC).
    return applySecurity(NextResponse.next(), request);
  }

  // 2. Locale routing for everything else.
  const response = intlMiddleware(request);
  return applySecurity(response, request);
}

function applySecurity(response: NextResponse, request: NextRequest): NextResponse {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const csp = buildCsp(nonce);
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("x-nonce", nonce);
  // Mark every request with a tiny request-id for log correlation.
  const rid = crypto.randomUUID();
  response.headers.set("x-request-id", rid);
  return response;
}

export const config = {
  // Run on everything except static assets, the Stripe webhook (which needs
  // raw body + signature verification, no locale wrapping), and Auth.js's API.
  matcher: [
    "/((?!_next|api/stripe/webhook|api/auth|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
