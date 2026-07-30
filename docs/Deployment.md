# RIVET — Deployment & Operations Guide

> Phase 7 (P7-4 → P7-7). How to provision, configure, deploy, and monitor the
> RIVET stack: **Next.js web (Vercel)** + **Express API (Render/Railway)** +
> **managed PostgreSQL** + **Cloudinary** + **Sentry**.

---

## 1. Topology

```
Browser ──▶ Vercel (apps/web, Next.js)
                     │  NEXT_PUBLIC_API_URL
                     ▼
             Render/Railway (apps/api, Express) ──▶ Managed PostgreSQL
                     │
                     └────────────▶ Cloudinary (media)
Errors/traces ─────▶ Sentry (web + api)
```

---

## 2. Environment variables

### API (`apps/api/.env` — see `.env.example`)

| Variable | Required | Notes |
|---|---|---|
| `PORT` | no | Defaults to `4000`. |
| `NODE_ENV` | prod | `production` in prod. |
| `CORS_ORIGIN` | yes | Comma-separated allowed web origins (the Vercel URL). |
| `DATABASE_URL` | yes | Managed Postgres connection string. |
| `JWT_ACCESS_SECRET` | yes | Long random string. Generated automatically on Render. |
| `JWT_REFRESH_SECRET` | yes | Long random string. Distinct from access. |
| `JWT_ACCESS_TTL` | no | Seconds (default `900`). |
| `JWT_REFRESH_TTL` | no | Seconds (default `604800`). |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | for uploads | From the Cloudinary dashboard. |
| `SENTRY_DSN` | optional | Enables error/perf reporting. Empty = disabled. |
| `SENTRY_ENVIRONMENT` | optional | e.g. `production`. |
| `SENTRY_TRACES_SAMPLE_RATE` | optional | `0.0`–`1.0` (default `0.1`). |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | seed only | First admin created by `pnpm db:seed`. |

### Web (`apps/web/.env.local` — see `.env.example`)

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical URL (OG tags, sitemap). |
| `NEXT_PUBLIC_API_URL` | yes | API base **including** `/api` (e.g. `https://rivet-api.onrender.com/api`). |
| `NEXT_PUBLIC_SENTRY_DSN` | optional | Client + server Sentry DSN. |
| `SENTRY_ENVIRONMENT` | optional | e.g. `production`. |
| `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` | optional | `0.0`–`1.0`. |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | CI only | Source-map upload during `next build`. |

> **Secrets policy:** never commit `.env`/`.env.local`. Store production values in
> the Vercel and Render/Railway dashboards. Use distinct secrets per environment
> (preview vs production).

---

## 3. Provision infrastructure (P7-4)

1. **PostgreSQL** — Render Postgres (created by `render.yaml`), Railway Postgres,
   Neon, or Supabase. Copy the connection string into `DATABASE_URL`.
2. **Cloudinary** — create a product environment; copy cloud name + API key/secret.
3. **Sentry** — create two projects (`rivet-web`, `rivet-api`); copy each DSN.

---

## 4. Deploy the API (Render — primary)

The repo ships a Render Blueprint at [`render.yaml`](../render.yaml) that
provisions the database and the API service together.

1. Render Dashboard → **New → Blueprint** → select this repo.
2. Render creates `rivet-db` and `rivet-api`, wiring `DATABASE_URL` automatically
   and generating the JWT secrets.
3. Fill the `sync: false` values in the dashboard: `CORS_ORIGIN`,
   `CLOUDINARY_*`, `SENTRY_DSN`.
4. Deploy. On every deploy Render runs:
   - build: `pnpm install → prisma generate → build API`
   - **pre-deploy: `prisma migrate deploy`** (P7-6 — migrations applied safely)
   - start: `node dist/server.js`
5. Health check: `GET /api/health`.
6. First-time only — seed the database from the Render shell:
   `pnpm db:seed`.

### Deploy the API (Railway — alternative)

Config at [`railway.json`](../railway.json). Create a project + Postgres plugin,
set the env vars above, and Railway will build and run
`prisma migrate deploy && start` on deploy.

---

## 5. Deploy the Web app (Vercel)

Config at [`apps/web/vercel.json`](../apps/web/vercel.json).

1. Vercel → **New Project** → import this repo.
2. **Root Directory** = `apps/web` (Vercel auto-detects the pnpm workspace root).
3. Framework: Next.js (auto). Build/install commands come from `vercel.json`.
4. Environment Variables: set `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`,
   and (optional) the `NEXT_PUBLIC_SENTRY_*` + `SENTRY_ORG/PROJECT/AUTH_TOKEN`.
5. Deploy. Preview deployments are created per PR; production on `main`.
6. After the first web deploy, update the API's `CORS_ORIGIN` to the Vercel URL.

---

## 6. Database migrations (P7-6)

- Author locally: `pnpm db:migrate` (creates a migration + applies to dev DB).
- Deploys apply pending migrations automatically:
  - Render: `preDeployCommand: prisma migrate deploy`
  - Railway: `startCommand` runs `prisma:deploy` before start
- Manual apply (any host): `pnpm --filter @rivet/api prisma:deploy`.

---

## 7. Post-deploy smoke tests (P7-6)

```bash
API_URL=https://rivet-api.onrender.com/api \
SITE_URL=https://rivet.vercel.app \
pnpm smoke
```

Checks API health/categories/products and web home/robots/sitemap; exits non-zero
on any failure. The [`Smoke & Uptime`](../.github/workflows/smoke.yml) workflow
runs this automatically after successful deployments, on demand, and every 30
minutes as a lightweight uptime check. Set repo **Variables** `PROD_API_URL` and
`PROD_SITE_URL`.

---

## 8. Monitoring (P7-7)

- **Errors & performance:** Sentry on both apps. Set the DSNs to enable; leaving
  them empty disables Sentry entirely (safe no-op).
  - API: initialized in `apps/api/src/instrument.ts`; unhandled 500s are captured
    in the central error handler.
  - Web: `instrumentation.ts` + `sentry.*.config.ts` + `instrumentation-client.ts`;
    `next.config.ts` is wrapped with `withSentryConfig` (source maps upload only
    when `SENTRY_AUTH_TOKEN` is set).
- **Uptime:** the scheduled smoke workflow (§7). For richer alerting, point an
  external monitor (BetterStack / UptimeRobot) at `/api/health` and the homepage.
- **Analytics:** enable Vercel Web Analytics in the Vercel dashboard (no code
  change required) or add a privacy-friendly analytics snippet in
  `apps/web/app/layout.tsx`.

---

## 9. CI/CD (P7-3)

- [`ci.yml`](../.github/workflows/ci.yml): lint → typecheck → unit tests → build,
  then Playwright E2E against an ephemeral Postgres service.
- [`lighthouse.yml`](../.github/workflows/lighthouse.yml): Lighthouse CI (90+).
- Deploys are triggered by Vercel/Render's native Git integration on merge to
  `main`; `smoke.yml` validates each deployment.
