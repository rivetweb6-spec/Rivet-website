# RIVET — River Company Digital Flagship

Monorepo for the RIVET public website and admin dashboard.

- **`apps/web`** — Next.js (App Router) + Tailwind v4 + Framer Motion + Lenis
- **`apps/api`** — Node + Express 5 + TypeScript + Prisma (PostgreSQL)
- **`docs/`** — Implementation plan, design, and task board

## Prerequisites

- Node 20+
- pnpm 11+ (`npm install -g pnpm`)
- A PostgreSQL database (local or managed) for the API

## Setup

```bash
pnpm install

# API env
cp apps/api/.env.example apps/api/.env
# → edit DATABASE_URL, JWT secrets, and (optional) CLOUDINARY_* in apps/api/.env

# Database
pnpm db:generate      # generate Prisma client
pnpm db:migrate       # create tables (requires DATABASE_URL)
pnpm db:seed          # seed categories, sample content, admin user
```

Default seeded admin: `admin@rivet.com` / `Admin123!` (override via `SEED_ADMIN_*`).

## Run

```bash
pnpm dev        # web (:3000) + api (:4000) together
pnpm dev:web    # web only
pnpm dev:api    # api only
```

- Web: http://localhost:3000
- API: http://localhost:4000/api/health

## API surface (all under `/api`)

| Area | Public | Admin (JWT) |
|---|---|---|
| Auth | — | `POST /auth/login`, `/auth/refresh`, `/auth/logout`, `GET /auth/me` |
| Categories | `GET /categories`, `/categories/:slug` | `POST/PUT/DELETE` |
| Products | `GET /products` (search/filter/paginate), `/products/:slug` (+related) | `POST/PUT/DELETE` |
| Services | `GET /services`, `/services/:slug` | `POST/PUT/DELETE` |
| News | `GET /news`, `/news/:slug` | `GET /news/admin/all`, `POST/PUT/DELETE` |
| Demo Requests | `POST /demo-requests` | `GET`, `PATCH /:id`, `GET /export` (CSV) |
| Contact | `POST /contact` | `GET /contact` |
| Company / Contact info | `GET /company`, `/contact-info` | `PUT` |
| Uploads | — | `POST /uploads` (Cloudinary) |
| Analytics | — | `GET /analytics/overview` |
| Realtime | — | `GET /events` (SSE — live demo-request badge) |

## Brand tokens

Single source of truth: `apps/web/app/globals.css` (`@theme`). Navy `#002F54`, Gold `#D69A2E`.
Swap official assets in `apps/web/lib/assets.ts` (semantic keys → URLs) with no layout changes.
