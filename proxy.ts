import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";

const intlMiddleware = createIntlMiddleware({
  locales: locales as unknown as string[],
  defaultLocale,
  localePrefix: "always",
});

const isDev = process.env.NODE_ENV !== "production";

/**
 * Build a strict, nonce-based CSP. In dev, React/Next need 'unsafe-eval' for
 * source maps and error overlays — production drops it.
 */
function buildCsp(nonce: string): string {
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    "https://js.stripe.com",
    "https://plausible.io",
    ...(isDev ? ["'unsafe-eval'"] : []),
  ];
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": scriptSrc,
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "font-src": ["'self'", "data:"],
    "connect-src": [
      "'self'",
      "https://api.stripe.com",
      "https://plausible.io",
      ...(process.env.R2_PUBLIC_HOST ? [`https://${process.env.R2_PUBLIC_HOST}`] : []),
      ...(isDev ? ["ws:", "wss:"] : []),
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

function withNonce(request: NextRequest, nonce: string): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

function applySecurity(response: NextResponse, nonce: string): NextResponse {
  response.headers.set("Content-Security-Policy", buildCsp(nonce));
  response.headers.set("x-nonce", nonce);
  response.headers.set("x-request-id", crypto.randomUUID());
  return response;
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = crypto.randomUUID().replace(/-/g, "");

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
    return applySecurity(withNonce(request, nonce), nonce);
  }

  // 2. Locale routing for everything else. The nonce is forwarded via the
  // request headers so `headers().get("x-nonce")` works in RSC.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  const forwardedReq = new NextRequest(request, { headers: requestHeaders });
  const response = intlMiddleware(forwardedReq);
  return applySecurity(response, nonce);
}

export const config = {
  // Run on the public site + /admin only.
  // Excluded entirely:
  //   - /api/*    (API routes own their own auth + don't need locale routing;
  //               next-intl would otherwise 307 them to /<locale>/api/... → 404)
  //   - /_next/*  (Next internals)
  //   - static files (anything with a dot in the path: favicon.ico, robots.txt,
  //                  sitemap.xml, /brand/*.jpg, …)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
