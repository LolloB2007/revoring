# Revoring

Bilingual marketing site + catalogue + e-commerce + blog + admin panel for **Revoring / One Infinite Training**.

Built on Next.js 16 (App Router) with TypeScript, Tailwind v4, shadcn-flavoured UI, Drizzle ORM + Neon Postgres, Auth.js, Stripe Checkout, Cloudflare R2 for media, Nodemailer for transactional + newsletter, TipTap for the blog editor, Lenis + Motion for the hero animation.

Full spec & rationale: `~/.claude/plans/https-revoring-com-en-use-trybloom-mcp-rosy-firefly.md`

## Setup

```bash
npm ci
cp .env.example .env.local           # fill in DB, Stripe, R2, SMTP, Upstash
npm run db:push                       # apply Drizzle schema
npm run dev                           # http://localhost:3000
```

## Key environment variables

| Var | Purpose |
|---|---|
| `AUTH_SECRET` | `openssl rand -base64 32`. Required for sessions + unsubscribe HMAC |
| `ADMIN_EMAIL` | Hard-coded admin login. Defaults to `lollo.barbagelata@gmail.com` |
| `ADMIN_IP_ALLOWLIST` | Optional CSV of CIDRs. When set, admin returns 404 outside them |
| `DATABASE_URL` | Neon Postgres URL with `?sslmode=require` |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Server-side Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client Stripe |
| `R2_*` | Cloudflare R2 (S3-compatible) for image uploads |
| `SMTP_*` | Client's company email — used for transactional + newsletter |
| `UPSTASH_REDIS_REST_*` | Rate limiting (login, signup, contact, newsletter) |

## Architecture summary

- `app/[locale]/` — public site (Italian `/it`, English `/en`), shares `LocaleLayout`
- `app/admin/` — hidden admin panel, gated by `ADMIN_EMAIL`, TOTP-required
- `app/api/` — auth callbacks, Stripe webhook (raw-body verified), newsletter double-opt-in, contact form, admin uploads
- `app/actions/` — server actions for cart, favorites, admin CRUD
- `lib/` — db, auth, stripe, r2, email, rate-limit, sanitize, seo, audit
- `db/schema.ts` — Drizzle schema (users, products, variants, cart, orders, blog, pages, newsletter, audit_log)
- `components/` — `site/`, `hero/`, `shop/`, `admin/`, `ui/`
- `proxy.ts` — locale routing, admin IP allowlist, CSP nonce, security headers
- `i18n.ts`, `messages/{en,it}.json` — next-intl wiring

## Security posture

See the **Security** section of the plan. Highlights:

- Vercel Firewall replaces Cloudflare; HSTS preload, nonce-based CSP, X-Frame-Options DENY
- Argon2id passwords, magic-link default sign-in, mandatory TOTP 2FA for admin
- Rate-limited login/signup/contact/newsletter via Upstash Redis (no-op in dev without keys)
- Drizzle parameterised queries + Zod on every input; DOMPurify on TipTap output
- Stripe webhook signature + 5-min replay window; server-side price recompute on every checkout
- R2 signed-URL direct uploads; MIME sniffing + 10 MB cap; no SVG
- Append-only `audit_log` for every admin action
- HMAC-signed unsubscribe links
- CI: typecheck + lint + build + `npm audit` + `osv-scanner` + gitleaks

## Phases shipped

1. ✅ Scaffold + security baseline
2. ✅ Design system + landing (hero scroll animation, cookie banner, language toggle, real Revoring logo)
3. ✅ Auth + magic-link account flow
4. ✅ Admin shell + TOTP setup + audit log + IP allowlist
5. ✅ Catalogue + admin product CRUD + R2 image uploads
6. ✅ Cart + Stripe Checkout + signed webhook + orders
7. ✅ Favorites
8. ✅ Blog + TipTap editor + sanitisation
9. ✅ Contacts + newsletter (double-opt-in + signed unsubscribe + admin composer) + legal page editor
10. ✅ AI imagery (higgsfield hero shipped; about + product shots queued via MCP)
11. ✅ SEO polish — dynamic sitemap (DB-driven slugs), JSON-LD on product + article, hreflang
12. ⌛ Security audit + go-live — pending Vercel/Neon/Stripe/SMTP credentials

## Outstanding (client-side)

- SMTP credentials (company mailbox)
- Stripe live keys + webhook endpoint
- Neon database URL
- R2 bucket + public host
- Domain + DNS
- Privacy / cookies / terms copy (pasted via `/admin/pages`)
- DKIM / SPF / DMARC records on the domain
