# RIVET — Deployment & Operations Guide

> How to provision, configure, deploy, and monitor the RIVET stack:
> **Next.js web** + **Express API** + **PostgreSQL** + **Cloudinary** + **Sentry**.
>
> Hosting is not tied to any provider. The web app and the API are ordinary Node
> applications; run them on any host that supports Node 24 (a VPS, Railway,
> Fly.io, a container platform, …). `railway.json` is kept as a ready-made
> config in case Railway is chosen.

---

## 1. Topology

```
Browser ──▶ Web (apps/web, Next.js)
              │  /api/* is proxied to NEXT_PUBLIC_API_URL
              ▼
            API (apps/api, Express) ──▶ PostgreSQL
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
| `CORS_ORIGIN` | yes | Comma-separated **exact** web origins (e.g. `https://www.your-domain.com`). Wildcards are refused at startup. |
| `DATABASE_URL` | yes | PostgreSQL connection string. |
| `JWT_ACCESS_SECRET` | yes | Random string, 32+ characters. |
| `JWT_REFRESH_SECRET` | yes | Random string, 32+ characters, different from the access secret. |
| `JWT_ACCESS_TTL` | no | Seconds (default `28800`). |
| `JWT_REFRESH_TTL` | no | Seconds (default `604800`). |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | for uploads | From the Cloudinary dashboard. Without them uploads go to local disk (`UPLOAD_DIR`), which must be a persistent volume. |
| `PUBLIC_API_URL` | recommended | Public origin of the API (no `/api`), used in stored image URLs. |
| `SENTRY_DSN` | optional | Enables error/perf reporting. Empty = disabled. |
| `SENTRY_ENVIRONMENT` | optional | e.g. `production`. |
| `SENTRY_TRACES_SAMPLE_RATE` | optional | `0.0`–`1.0` (default `0.1`). |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | prod (first boot) | First admin account. Required in production: valid email, password 12+ characters and not a default. Without them no admin is created. |

Generate secrets with e.g. `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.

### Web (`apps/web/.env.local` — see `.env.example`)

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical URL (OG tags, sitemap). |
| `NEXT_PUBLIC_API_URL` | yes | API base **including** `/api` (e.g. `https://api.your-domain.com/api`). Must be set at **build** time; without it the build warns and proxies to `localhost:4000`. |
| `NEXT_PUBLIC_SENTRY_DSN` | optional | Client + server Sentry DSN. |
| `SENTRY_ENVIRONMENT` | optional | e.g. `production`. |
| `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` | optional | `0.0`–`1.0`. |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | CI only | Source-map upload during `next build`. |

> **Secrets policy:** never commit `.env`/`.env.local`. Store production values in
> your host's secret settings. Use distinct secrets per environment.

---

## 3. Provision infrastructure

1. **PostgreSQL** — any managed or self-hosted Postgres 16 (Neon, Supabase,
   Railway, a VPS, …). Copy the connection string into `DATABASE_URL`.
2. **Cloudinary** — create a product environment; copy cloud name + API key/secret.
3. **Sentry** (optional) — create two projects (`rivet-web`, `rivet-api`); copy each DSN.

---

## 4. Deploy the API

From the repository root:

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm --filter @rivet/api build
pnpm --filter @rivet/api prisma:deploy   # apply pending migrations
pnpm --filter @rivet/api start           # node dist/server.js
```

- Health check: `GET /api/health`.
- On first boot with an empty `User` table, an admin is created from
  `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. In production both are required and
  the password must be 12+ characters and not a known default (such as
  `Admin123!`); otherwise no admin is created and the log says what to set.
- Optional sample content: `pnpm db:seed` (same admin rules apply).
- **Railway:** [`railway.json`](../railway.json) already runs the build and
  `prisma:deploy && start`; create a project + Postgres and set the env vars above.

---

## 5. Deploy the Web app

```bash
pnpm install --frozen-lockfile
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api \
NEXT_PUBLIC_SITE_URL=https://www.your-domain.com \
pnpm --filter @rivet/web build
pnpm --filter @rivet/web start
```

- The browser calls same-origin `/api/*`; `next.config.ts` proxies it to
  `NEXT_PUBLIC_API_URL`. Admin file uploads go directly to the API.
- Security headers (HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy`) are
  set in `next.config.ts`, so they apply on any host.
- After the web app is live, set the API's `CORS_ORIGIN` to the exact web
  origin(s) and restart the API.

---

## 6. Database migrations

- Author locally: `pnpm db:migrate` (creates a migration + applies to dev DB).
- Apply on deploy (any host): `pnpm --filter @rivet/api prisma:deploy` before
  starting the API. `railway.json` does this automatically.

---

## 7. Post-deploy smoke tests

```bash
API_URL=https://api.your-domain.com/api \
SITE_URL=https://www.your-domain.com \
pnpm smoke
```

Checks API health/categories/products and web home/robots/sitemap; exits non-zero
on any failure. The [`Smoke & Uptime`](../.github/workflows/smoke.yml) workflow
runs this on demand and every 30 minutes as a lightweight uptime check. Set repo
**Variables** `PROD_API_URL` and `PROD_SITE_URL`.

---

## 8. Monitoring

- **Errors & performance:** Sentry on both apps. Set the DSNs to enable; leaving
  them empty disables Sentry entirely (safe no-op).
  - API: initialized in `apps/api/src/instrument.ts`; unhandled 500s are captured
    in the central error handler.
  - Web: `instrumentation.ts` + `sentry.*.config.ts` + `instrumentation-client.ts`;
    `next.config.ts` is wrapped with `withSentryConfig` (source maps upload only
    when `SENTRY_AUTH_TOKEN` is set).
- **Uptime:** the scheduled smoke workflow (§7). For richer alerting, point an
  external monitor (BetterStack / UptimeRobot) at `/api/health` and the homepage.
- **Analytics:** add a privacy-friendly analytics snippet in
  `apps/web/app/layout.tsx`.

---

## 9. CI/CD

- [`ci.yml`](../.github/workflows/ci.yml): lint → typecheck → unit tests → build,
  then Playwright E2E against an ephemeral Postgres service.
- [`lighthouse.yml`](../.github/workflows/lighthouse.yml): Lighthouse CI (90+).
- Deployment itself depends on the host chosen; run `smoke.yml` (or `pnpm smoke`)
  after each deploy.
