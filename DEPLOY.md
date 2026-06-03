# Deploy Revoring to Vercel

End-to-end: GitHub repo → Vercel project → Upstash Redis → first live site.

Total clicking time: ~20 minutes if you don't already have accounts; ~5 if you do.

## 0 · One-time accounts

You need accounts on (free in all cases):

1. **GitHub** — to host the repo
2. **Vercel** — to host the site (sign in with GitHub)
3. **Stripe** — for payments (use test mode at first)
4. **Cloudflare** — for R2 image storage (optional; admin can't upload product images without it, but everything else works)

You do **not** need a separate Upstash account — Vercel provisions it for you inside the Vercel Marketplace.

---

## 1 · Push the repo to GitHub

```bash
cd ~/revoring
git init
git add .
git commit -m "Initial revoring site"
```

Create the repo on GitHub (web UI is fastest):

→ https://github.com/new
- Owner: `lollob2007`
- Name: `revoring`
- Private (recommended)
- Don't tick "Initialize with README"

Then back in the terminal:

```bash
git branch -M main
git remote add origin https://github.com/lollob2007/revoring.git
git push -u origin main
```

---

## 2 · Create the Vercel project

→ https://vercel.com/new

1. Click **Import** next to the `lollob2007/revoring` repo
2. Framework preset is auto-detected as **Next.js** — leave it
3. Don't click Deploy yet. Expand the **Environment Variables** section and add the placeholders below (you can paste them all at once via "Bulk add"). Then click **Deploy**.

The first deploy will likely fail because Stripe / R2 / KV aren't wired up yet — that's expected. We fix it in step 3.

### Required env vars for the first deploy

| Var | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://revoring.vercel.app` (Vercel gives you this URL after first deploy — you'll come back and update it) |
| `AUTH_SECRET` | Generate one: `openssl rand -base64 32` |
| `AUTH_TRUST_HOST` | `true` |
| `ADMIN_EMAIL` | `lollo.barbagelata@gmail.com` |

That's the minimum for the marketing site to render. Everything else gets added in step 3.

---

## 3 · Provision Upstash Redis (the data store)

In your Vercel project:

1. Go to the **Storage** tab
2. Click **Create Database** → pick **Upstash for Redis** (this is what Vercel KV became)
3. Region: **Frankfurt (eu-central-1)** to match the Vercel deploy region we set in `vercel.json`
4. Plan: **Free** (10k commands/day, plenty for this traffic)
5. After it's created, click **Connect Project** and connect it to your `revoring` project for **all three** environments (Production, Preview, Development)

Vercel auto-injects four env vars: `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`. The code only needs `KV_REST_API_URL` + `KV_REST_API_TOKEN`.

### Seed the initial catalogue into KV

After the integration is connected, pull the env locally and run the seed script:

```bash
# Install the Vercel CLI if you don't have it
npm i -g vercel
vercel login
vercel link            # connect this folder to the Vercel project
vercel env pull .env.production.local

# Run the seeder (copies data/*.json content tables into KV)
node --env-file=.env.production.local scripts/seed-kv.mjs
```

You should see:

```
[ok]   categories.json → revoring:categories  (1 rows)
[ok]   products.json   → revoring:products    (3 rows)
[ok]   variants.json   → revoring:variants    (3 rows)
```

Now the catalogue page on prod will show Revoring Lite / Medium / Strong.

---

## 4 · Wire up Stripe (payments)

In Stripe Dashboard (https://dashboard.stripe.com):

1. **Developers → API keys** — copy the **Publishable** and **Secret** keys (use **test mode** initially)
2. Add to Vercel project env:
   - `STRIPE_SECRET_KEY` = `sk_test_…`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_test_…`
3. **Developers → Webhooks → Add endpoint**
   - Endpoint URL: `https://revoring.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `charge.refunded`, `payment_intent.canceled`
   - Save → copy the **Signing secret** (`whsec_…`)
4. Add `STRIPE_WEBHOOK_SECRET` = `whsec_…` to Vercel env

---

## 5 · Wire up Cloudflare R2 (image uploads — optional)

If the admin needs to upload new product / blog images from the browser, you need R2. Otherwise skip this — the seeded products use `/brand/product-*.jpg` images already shipped in the repo.

In Cloudflare Dashboard:

1. **R2** → Create bucket: `revoring-media`
2. Bucket → **Settings** → **Public access** → enable, copy the `pub-….r2.dev` URL
3. **R2 → API tokens** → Create API token → R2 read+write
4. Add to Vercel env:
   - `R2_ACCOUNT_ID` = your Cloudflare account ID
   - `R2_ACCESS_KEY_ID` = generated access key
   - `R2_SECRET_ACCESS_KEY` = generated secret
   - `R2_BUCKET` = `revoring-media`
   - `R2_PUBLIC_HOST` = `pub-xxxx.r2.dev` (no `https://` prefix)
   - `REVORING_R2_PUBLIC_HOST` = same value (used by `next.config.ts` to allow the domain in `next/image`)

---

## 6 · Wire up email (optional in dev, required for prod)

Newsletter double-opt-in and the contact form need an SMTP relay. Easiest is your existing company mailbox (Google Workspace, Aruba, etc.).

Add to Vercel env:

- `SMTP_HOST` = e.g. `smtp.gmail.com`
- `SMTP_PORT` = `465`
- `SMTP_SECURE` = `true`
- `SMTP_USER` = `noreply@revoring.com` (or wherever)
- `SMTP_PASS` = app password
- `SMTP_FROM` = `Revoring <noreply@revoring.com>`

Skip and the form silently logs to Vercel logs.

---

## 7 · Trigger a rebuild

After all env vars are set:

→ Vercel project → **Deployments** tab → top-right of the latest deploy → **Redeploy** → tick "Use existing Build Cache" off → Redeploy

Visit `https://revoring.vercel.app/it`. You should see the homepage with the seeded products in the catalogue.

---

## 8 · First admin login

→ `https://revoring.vercel.app/it/account/signin`
- Email: `lollo.barbagelata@gmail.com`
- Password: `admin`

You'll land on `/it/account`. The black admin bar appears at the top of every public page. Click **Vai all'admin →** for the dashboard.

Change the admin password literal at `lib/auth.ts:30` (`ADMIN_PASSWORD_LITERAL`) **before** going live with real customers.

---

## 9 · Custom domain (optional)

Vercel project → **Settings → Domains** → add `revoring.com`.

Cloudflare/Aruba/wherever DNS is hosted:
- Add `A` record `@` → `76.76.21.21`
- Add `CNAME` record `www` → `cname.vercel-dns.com`

Vercel issues an SSL cert automatically. Update `NEXT_PUBLIC_SITE_URL` to `https://revoring.com` and redeploy.

---

## Day-to-day

**Update content**
- Edit a product or blog post → admin UI on the live site. Changes hit KV immediately.
- Edit static page copy (About, Contacts, legal) → edit the `.tsx` file in this repo → `git push` → Vercel auto-deploys in ~60 s.

**Pull production data back to local**
```bash
node --env-file=.env.production.local scripts/seed-kv.mjs   # re-seed (overwrites prod content tables)
```
There's no built-in "export from KV" yet — if you want a snapshot, use the Upstash dashboard's data browser.

**Switch back to local file-store dev**
- Don't set `KV_REST_API_URL` in `.env.local` and the file-backed store kicks in automatically. Data lives in `./data/*.json`.

**Custom hardening before public launch**
1. Change `ADMIN_PASSWORD_LITERAL` in `lib/auth.ts`
2. Enable 2FA at `/admin/security/2fa`
3. Set `ADMIN_IP_ALLOWLIST` if you have a fixed office IP
4. Move Stripe from test → live keys
5. Set up SPF/DKIM/DMARC on the sending domain
6. Add Sentry DSN for error monitoring
