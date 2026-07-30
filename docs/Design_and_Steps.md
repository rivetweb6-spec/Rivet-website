# RIVET — Design & Build Steps

> Companion to `Implementation_plan.md`. This document locks the **design system**,
> **repository/folder design**, **i18n + placeholder strategy**, and the exact
> **step-by-step build sequence** based on the confirmed decisions:
> Express API · Monorepo · English-first (i18n-ready) · client-provided assets w/ placeholders.

---

## Part A — Design

### A1. Confirmed Architecture

```
river-company/                     # pnpm workspace monorepo
│
├── apps/
│   ├── web/                       # Next.js (App Router) — public site + admin UI
│   │   ├── app/
│   │   │   ├── [locale]/          # i18n segment (en today; am later)
│   │   │   │   ├── (public)/      # home, products, services, company, news, contact
│   │   │   │   └── (admin)/       # protected dashboard
│   │   │   ├── api/               # thin BFF route handlers (optional proxy)
│   │   │   └── sitemap.ts / robots.ts
│   │   ├── components/            # app-specific compositions
│   │   ├── lib/                   # api client, hooks, motion, i18n config
│   │   ├── messages/              # en.json (am.json later)
│   │   └── public/                # placeholder assets (swap-in later)
│   │
│   └── api/                       # Node + Express + TypeScript
│       └── src/
│           ├── config/            # env, cloudinary, cors, logger
│           ├── middleware/        # auth, validate(zod), error, rateLimit
│           ├── modules/           # feature-first: auth, products, categories,
│           │                      #   services, news, demo-requests, company,
│           │                      #   contact, uploads, analytics
│           │   └── <feature>/     # routes · controller · service · schema
│           ├── realtime/          # SSE/WS for demo-request notifications
│           ├── app.ts             # express app
│           └── server.ts          # bootstrap
│
├── packages/
│   ├── ui/                        # shadcn/ui + brand tokens + motion primitives
│   ├── types/                     # shared TS types + zod schemas (front/back)
│   ├── config/                    # eslint, tsconfig, tailwind preset, prettier
│   └── utils/                     # formatters, slugify, csv/excel, date, guards
│
├── prisma/                        # schema.prisma, migrations, seed.ts
├── docs/
├── package.json                   # workspace root
├── pnpm-workspace.yaml
└── README.md
```

**Data flow:** Browser → Next.js (RSC/SSR/ISR) → typed API client (`packages/types`) →
Express REST API → Prisma → PostgreSQL. Media → Cloudinary. Admin mutations → API →
realtime channel → live notification badge in dashboard.

---

### A2. Brand Design Tokens (single source of truth)

Defined once in `packages/config` (Tailwind preset) as CSS variables, consumed everywhere.
When the client sends official brand colors, we change these values only.

**Color**
| Token | Value | Use |
|---|---|---|
| `--navy` | `#002F54` | Nav, footer, headings, primary buttons, sidebar, data viz, CTA bands |
| `--gold` | `#D69A2E` | Hover states, dividers, badges, active tabs, underlines (≤10–15% of viewport) |
| `--ink` | `#1E1E1E` | Body copy, tables, form labels, line icons |
| `--white` | `#FFFFFF` | Canvas, cards, forms |
| `--bg` | `#F7F8FA` | Light background |
| `--border` | `#E5E7EB` | Borders |
| `--divider` | `#E2E8F0` | Hairline dividers |
| `--muted` | `#64748B` | Muted text |
| `--success` / `--warning` / `--error` | `#16A34A` / `#F59E0B` / `#DC2626` | Semantic states |

**Type scale** (fixed, never deviate): `12 / 14 / 16 / 20 / 28 / 40 / 56 / 72px`
- Display/Headings: **Poppins** (or Montserrat) — tight tracking at large sizes.
- Body: **Inter** — line-height 1.6–1.7.
- Eyebrow/Labels: **Inter**, uppercase, letter-spaced, small navy/gold.

**Radius:** `12 / 16 / 20px` · **Shadows:** layered, low-opacity (`sm / md / lg / bloom`).
**Rhythm:** section padding `96–140px` desktop; hairline 1px dividers over heavy borders.

---

### A3. Component & Motion Design

**Core primitives (`packages/ui`)**
- `Button` — navy base, gold hover, ripple/ink feedback, variants: primary(gold) / secondary / ghost.
- `Card` — hover lift (4–8px), shadow bloom, gold hairline border, optional image-zoom (1.04–1.08).
- `Section`, `Container`, `Eyebrow`, `Divider`, `Field/Input` (refined inline error state, no harsh red boxes).

**Motion system**
- **Lenis** global smooth scroll provider.
- **GSAP + ScrollTrigger** for scroll-driven sequences (hero parallax, timeline, staggered section reveals).
- **Framer Motion** for component orchestration, modals, page transitions.
- Helpers: `FadeUp`, `Stagger`, `Parallax`, `CountUp`, `Reveal`, `BlurUpImage`, `DragGallery`.
- **`prefers-reduced-motion`** honored globally; motion never blocks LCP/interaction.

**Signature moments:** cinematic hero (parallax bg + staggered text), animated counters on
viewport entry, drag-to-explore product gallery with inertia, shared-element news transition,
skeleton loaders matching final layout, blur-up lazy images.

---

### A4. i18n Strategy (English-first, future-proof)

- **`next-intl`** with a `[locale]` route segment; `en` is the only active locale in v1.
- All UI copy in `apps/web/messages/en.json` — **no hard-coded strings** in components.
- DB content is locale-aware by design: translatable fields modeled so an Amharic column/row
  can be added later without schema rewrites (either JSON `{ en, am }` fields or a
  `Translation` side-table — decided at schema time, defaulting to JSON for v1 simplicity).
- Locale-aware routing, `hreflang`, and formatting (dates/numbers) wired now.
- **Result:** adding Amharic later = add `am.json` + translated content + enable locale. No refactor.

---

### A5. Placeholder Asset Strategy (zero-rework swap-in)

- Central **asset manifest** (`apps/web/lib/assets.ts`) maps semantic keys →
  file paths (e.g. `hero.video`, `logo.primary`, `product.elevator.1`).
- Components reference **keys**, never raw paths — replacing a placeholder = change one manifest entry.
- Placeholders: royalty-free construction/architecture/elevator/granite imagery, color-graded
  toward the Navy/Gold palette; a clean hero image/video of premium installations.
- Fixed aspect-ratio containers + `next/image` blur placeholders so swapping real assets
  **never shifts layout**.
- Logo: temporary wordmark component swappable for the official SVG.

---

## Part B — Build Steps (execution order)

Each step is a shippable increment; the Home page is the vertical slice proving the full stack.

### Step 0 — Repo & Tooling
1. Init pnpm monorepo (`pnpm-workspace.yaml`, root scripts).
2. `packages/config`: shared TSConfig, ESLint, Prettier, Tailwind preset (brand tokens).
3. Husky + lint-staged + commitlint; base CI (lint/typecheck/build).
4. Scaffold `apps/web` (Next.js + TS + Tailwind + shadcn/ui) and `apps/api` (Express + TS).
5. `.env` templates for web + api; README with run instructions.

### Step 1 — Design System (`packages/ui`)
1. Implement tokens (colors, type scale, radius, shadows, spacing).
2. Fonts via `next/font` (Poppins/Montserrat + Inter).
3. Build primitives (Button, Card, Section, Eyebrow, Divider, Field) + motion helpers + Lenis provider.
4. Ship `/_styleguide` route showcasing every token/component.

### Step 2 — Database (`prisma/`)
1. Model schema: User, Category, Product, ProductImage, Service, NewsArticle,
   DemoRequest (status enum), CompanyInfo, ContactInfo, ContactMessage (i18n-aware fields).
2. First migration + `seed.ts` (demo content + one admin user).

### Step 3 — Backend API (`apps/api`)
1. App skeleton: config, Helmet, CORS, rate limit, pino logger, zod-validate + error middleware.
2. Auth module: bcrypt + JWT (access) + refresh (httpOnly cookie); `/auth/*`.
3. Cloudinary uploads (signed) + blur placeholder generation.
4. Public read endpoints (categories, products w/ search/filter/pagination, product-by-slug,
   related, services, news, company, contact) + `POST /demo-requests`, `POST /contact`.
5. Admin CRUD endpoints (products+images, categories, services, news, company, contact),
   demo-request status/notes, CSV/Excel export, analytics aggregation.
6. Realtime channel (SSE/WS) for new demo-request notifications.
7. Publish typed API client + zod schemas into `packages/types`.

### Step 4 — Public Website (`apps/web`)
1. Global shell: sticky nav (transparent→frosted/navy on scroll), search overlay, gold
   Request-Demo CTA, navy footer, mobile menu, i18n wiring.
2. **Home** (full vertical slice): hero → intro → categories → featured products → services →
   why-choose → stats band → latest news → Request-a-Private-Demo section + modal.
3. Products (search/filter/pagination) → Product Detail (zoom/drag gallery, specs, related, inquiry).
4. Services · Company (scroll-driven timeline) · News (archive + article) · Contact (brand-styled map, socials).
5. SEO per page: metadata, OG/Twitter, Schema.org, sitemap, robots.

### Step 5 — Admin Dashboard (`apps/web/(admin)`)
1. Auth gate + protected layout: navy sidebar (gold active), topbar w/ notification badge + profile.
2. Dashboard analytics (cards + charts).
3. Modules: Products (CRUD + multi-image + reorder), Categories, News (Tiptap), Services,
   Company Info (timeline builder), Contact Info, Demo Requests (workflow + export), Profile.
4. Skeletons, optimistic updates, toasts, confirm dialogs, empty states.

### Step 6 — Harden: Perf · SEO · A11y
1. SSR/ISR tuning, `next/image` + Cloudinary loader, code-splitting, blur-up.
2. WCAG 2.1 AA pass (landmarks, focus, ARIA, contrast, keyboard, reduced motion).
3. Lighthouse CI; hit 90+ Performance/Accessibility/Best-Practices/SEO.

### Step 7 — Test, CI/CD, Deploy
1. Vitest (unit), Playwright (demo request, admin CRUD, auth), API integration tests.
2. GitHub Actions: lint → typecheck → test → build → Lighthouse.
3. Deploy: Vercel (web) · Railway/Render (api) · managed PostgreSQL · Cloudinary; migrations on deploy; Sentry.

---

## Part C — Definition of Done (per feature)
- Uses **only** brand tokens (no stray hex), respects type scale & spacing rhythm.
- Responsive across all breakpoints; motion respects reduced-motion.
- Content from API/DB (no hard-coded copy); strings via i18n messages.
- Accessible (keyboard + screen-reader) and passes Lighthouse budget.
- Placeholder assets referenced via manifest keys for zero-rework swap-in.

---

## Immediate Next Action
On your go-ahead, I start at **Step 0** (scaffold the monorepo + tooling + Tailwind brand
preset), then **Step 1** design system with a live `/_styleguide`, then build the **Home page
vertical slice** end-to-end to validate the full stack.
