# RIVET — Task Design (Start → End)

> Granular, checkable task board derived from `Implementation_plan.md` and `Design_and_Steps.md`.
> Confirmed context: **Express API · Monorepo (pnpm) · English-first + i18n-ready · placeholder assets**.
> Legend: `[ ]` todo · `[~]` in progress · `[x]` done. IDs are stable references (e.g. `P3-H4`).

---

## Phase 0 — Foundation: Repo, Tooling, Config  (`P0`)

- [ ] **P0-1** Initialize monorepo: `package.json` (root), `pnpm-workspace.yaml`, Node/pnpm version pin (`.nvmrc`, `engines`).
- [ ] **P0-2** Root scripts: `dev`, `build`, `lint`, `typecheck`, `test`, `format`, `db:*` (via `turbo` or pnpm filters).
- [ ] **P0-3** `packages/config`: shared `tsconfig.base.json`, ESLint flat config, Prettier config.
- [ ] **P0-4** `packages/config`: Tailwind **brand preset** (tokens: colors, type scale, radius, shadows, spacing).
- [ ] **P0-5** `packages/utils`: slugify, currency/number/date formatters, csv/excel helpers, zod guards.
- [ ] **P0-6** `packages/types`: base shared types + zod schema barrel (filled per feature later).
- [ ] **P0-7** Scaffold `apps/web` (Next.js App Router + TS + Tailwind + shadcn/ui init).
- [ ] **P0-8** Scaffold `apps/api` (Express + TS + tsx/nodemon dev, build via tsc/tsup).
- [ ] **P0-9** Env management: `.env.example` for web + api; typed env loader (zod) in each app.
- [ ] **P0-10** Husky + lint-staged + commitlint; EditorConfig; `.gitignore`.
- [ ] **P0-11** Root `README.md`: setup, run, folder map.
- [ ] **P0-12** Base GitHub Actions CI: install → lint → typecheck → build.

**Exit:** `pnpm dev` runs web + api; lint/typecheck/build pass in CI.

---

## Phase 1 — Design System & UI Library  (`P1`  → `packages/ui`)

- [ ] **P1-1** Wire fonts via `next/font`: Poppins/Montserrat (display) + Inter (body/eyebrow).
- [ ] **P1-2** Token layer as CSS variables + Tailwind mapping (consumes P0-4).
- [ ] **P1-3** `Button` (primary-gold / secondary / ghost) + ripple/ink feedback + gold hover.
- [ ] **P1-4** `Card` (hover lift, shadow bloom, gold hairline, optional image-zoom).
- [ ] **P1-5** Layout primitives: `Container`, `Section` (96–140px rhythm), `Eyebrow`, `Divider` (1px hairline).
- [ ] **P1-6** Form primitives: `Field`, `Input`, `Textarea`, `Select` with refined inline error state.
- [ ] **P1-7** Feedback: `Toast`, `Skeleton` (layout-shaped), `Badge`, `Modal/Dialog` (glass overlay).
- [ ] **P1-8** Motion foundation: Lenis smooth-scroll provider + `prefers-reduced-motion` guard.
- [ ] **P1-9** Motion helpers: `FadeUp`, `Stagger`, `Parallax`, `Reveal`, `CountUp`, `BlurUpImage`, `DragGallery`.
- [ ] **P1-10** GSAP + ScrollTrigger setup + Framer Motion page-transition wrapper.
- [ ] **P1-11** Custom cursor states for interactive elements (desktop).
- [ ] **P1-12** `/_styleguide` route rendering all tokens + components.

**Exit:** Every primitive visible and brand-accurate on `/_styleguide`.

---

## Phase 2 — Database & Domain Model  (`P2`  → `prisma/`)

- [ ] **P2-1** Prisma init + datasource (PostgreSQL) + client generation.
- [ ] **P2-2** Models: `User` (role enum), `Category`, `Product`, `ProductImage`.
- [ ] **P2-3** Models: `Service`, `NewsArticle`, `DemoRequest` (status enum), `ContactMessage`.
- [ ] **P2-4** Singletons: `CompanyInfo` (history/vision/mission/values/timeline/achievements/certs), `ContactInfo` (address, phone, email, whatsapp, socials, map coords).
- [ ] **P2-5** i18n-aware translatable fields (JSON `{ en }` now, `am` later) + indexes/slugs/relations.
- [ ] **P2-6** First migration.
- [ ] **P2-7** `seed.ts`: demo categories/products/services/news + one admin user (bcrypt).
- [ ] **P2-8** Export Prisma-derived types/zod into `packages/types`.

**Exit:** `db:migrate` + `db:seed` produce a queryable, populated DB.

---

## Phase 3 — Backend API  (`P3`  → `apps/api`)

**Core**
- [ ] **P3-C1** Express app: Helmet, CORS, compression, rate limit, pino logger.
- [ ] **P3-C2** Middleware: `validate(zod)`, centralized error handler, 404, async wrapper.
- [ ] **P3-C3** Cloudinary config + signed upload service + blur-placeholder generation.
- [ ] **P3-C4** Health/readiness endpoints; OpenAPI/Postman collection scaffold.

**Auth**
- [ ] **P3-A1** bcrypt hashing + JWT access token + refresh token (httpOnly cookie).
- [ ] **P3-A2** `POST /auth/login`, `/auth/refresh`, `/auth/logout`, `GET /auth/me`.
- [ ] **P3-A3** `requireAuth` + role guard middleware.

**Public read endpoints**
- [ ] **P3-P1** Categories: list, by-slug.
- [ ] **P3-P2** Products: list (search + filter + pagination), by-slug, related.
- [ ] **P3-P3** Services: list, by-slug.
- [ ] **P3-P4** News: list (filter by category), by-slug.
- [ ] **P3-P5** Company info + Contact info (read).
- [ ] **P3-P6** `POST /demo-requests` (zod-validated, persists).
- [ ] **P3-P7** `POST /contact` (contact message).

**Admin (protected) endpoints**
- [ ] **P3-M1** Products CRUD + multi-image upload + image reorder/delete.
- [ ] **P3-M2** Categories CRUD + ordering.
- [ ] **P3-M3** Services CRUD.
- [ ] **P3-M4** News CRUD (draft/publish).
- [ ] **P3-M5** Company Info + Contact Info update.
- [ ] **P3-M6** Demo Requests: list/filter, status update, admin notes.
- [ ] **P3-M7** Export demo requests → CSV/Excel.
- [ ] **P3-M8** Dashboard analytics aggregation endpoint.

**Realtime**
- [ ] **P3-R1** SSE/WS channel; emit on new demo request → drives live badge.

- [ ] **P3-T1** API integration tests for auth, products, demo-requests.

**Exit:** Typed client in `packages/types`; all endpoints tested and documented.

---

## Phase 4 — Public Website  (`P4`  → `apps/web`)

**Global shell & infra**
- [ ] **P4-G1** i18n wiring (`next-intl`, `[locale]`, `messages/en.json`, locale routing/formatting).
- [ ] **P4-G2** API client + data-fetching hooks (RSC + client), error/loading conventions.
- [ ] **P4-G3** Asset manifest (`lib/assets.ts`) + placeholder set + swappable logo component.
- [ ] **P4-G4** Sticky nav: transparent-over-hero → frosted/navy on scroll (eased), links + expandable search overlay + always-visible gold **Request Demo** CTA + mobile menu.
- [ ] **P4-G5** Navy footer: description, products, services, quick links, contact, socials (gold hover), copyright, privacy.

**Home page (vertical slice)**
- [ ] **P4-H1** Cinematic hero: looping video/image sequence, navy gradient overlay (WCAG contrast), staggered headline, tiered CTAs, pulsing scroll cue.
- [ ] **P4-H2** Company introduction (editorial split layout + understated gold-underline link).
- [ ] **P4-H3** Product categories gallery (hover crossfade overlay + zoom + gold underline).
- [ ] **P4-H4** Featured products (asymmetric magazine grid, hover lift/zoom/hairline).
- [ ] **P4-H5** Services (icon-led cards).
- [ ] **P4-H6** Why Choose RIVET (line-art icon cards, navy→gold hover).
- [ ] **P4-H7** Statistics band (full-width navy, counters on viewport entry, faint line motif).
- [ ] **P4-H8** Latest news (editorial cards → shared-element transition).
- [ ] **P4-H9** Request-a-Private-Demo section + modal (fields, real-time validation, save, designed success moment, optional video redirect).

**Inner pages**
- [ ] **P4-PR1** Products page: search, filters, category select, editorial grid, pagination.
- [ ] **P4-PR2** Product detail: multi-image drag/pinch zoom gallery, specs, features, brand, origin, description, related, inquiry button.
- [ ] **P4-SV1** Services page: narrative cards.
- [ ] **P4-CO1** Company page: history, vision, mission, values, scroll-driven animated timeline, achievements, certifications.
- [ ] **P4-NW1** News page: filterable archive + full article view.
- [ ] **P4-CT1** Contact page: form, brand-styled Google Map, address, clickable phone/email, WhatsApp/Facebook/LinkedIn/Telegram.

**Exit:** All public pages live, brand-accurate, motion-complete, data from API.

---

## Phase 5 — Admin Dashboard  (`P5`  → `apps/web/(admin)`)

- [x] **P5-1** Auth gate: login screen + protected layout + session refresh + logout.
- [x] **P5-2** Shell: navy sidebar (white text, gold active), topbar w/ notification badge + profile menu.
- [x] **P5-3** Dashboard analytics: overview cards + interactive charts.
- [x] **P5-4** Products module: table + create/edit forms + multi-image upload + drag-reorder.
- [x] **P5-5** Categories module (CRUD + ordering).
- [x] **P5-6** News module: Tiptap rich-text editor, cover image, draft/publish.
- [x] **P5-7** Services module (CRUD).
- [x] **P5-8** Company Information editor (incl. timeline builder).
- [x] **P5-9** Contact Information editor.
- [x] **P5-10** Demo Requests: table, status workflow, admin notes, **live badge**, CSV/Excel export.
- [x] **P5-11** User Profile (update details, change password).
- [x] **P5-12** UX polish: skeletons, optimistic updates, toasts, confirm dialogs, empty states.

**Exit:** Full CRUD + live notifications + export operational.

---

## Phase 6 — Performance, SEO & Accessibility  (`P6`)

- [x] **P6-1** `next/image` + Cloudinary loader + blur placeholders everywhere.
- [x] **P6-2** SSR/ISR strategy per route; code-splitting; bundle audit.
- [x] **P6-3** Metadata + Open Graph/Twitter per page; SEO-friendly slugs.
- [x] **P6-4** `sitemap.xml`, `robots.txt`, Schema.org (Organization, Product, Article, Breadcrumb).
- [x] **P6-5** A11y pass: landmarks, focus states, ARIA, keyboard nav, reduced motion.
- [x] **P6-6** Contrast validation across Navy/Gold combinations.
- [x] **P6-7** Lighthouse CI; achieve 90+ on Performance/Accessibility/Best-Practices/SEO.

**Exit:** All Lighthouse targets met; a11y verified.

---

## Phase 7 — Testing, CI/CD & Deployment  (`P7`)

- [x] **P7-1** Vitest unit tests (utils, components, api services).
- [x] **P7-2** Playwright e2e: demo-request flow, admin CRUD, auth.
- [x] **P7-3** CI pipeline: lint → typecheck → test → build → Lighthouse.
- [x] **P7-4** Provision managed PostgreSQL + Cloudinary; secrets/env per environment. *(configs + `.env.example` + docs; account provisioning is a dashboard step)*
- [x] **P7-5** Deploy `apps/web` → Vercel (preview + prod); `apps/api` → Railway/Render. *(`vercel.json`, `render.yaml`, `railway.json`)*
- [x] **P7-6** DB migration step on deploy; smoke tests post-deploy.
- [x] **P7-7** Sentry (web + api), uptime + basic analytics.
- [x] **P7-8** Handoff docs: env vars, asset-swap guide, admin user guide.

**Exit:** Production live, monitored, documented.

---

## Milestone Map

| Milestone | Phases | Outcome |
|---|---|---|
| **M1 — Skeleton** | P0, P1 | Monorepo runs; design system on `/_styleguide` |
| **M2 — Data & API** | P2, P3 | Seeded DB + tested REST API + realtime |
| **M3 — Showroom** | P4 | Full public site (Home slice first) |
| **M4 — Control Room** | P5 | Admin CMS with live notifications + export |
| **M5 — Hardened** | P6 | Lighthouse 90+, WCAG AA |
| **M6 — Live** | P7 | Deployed, monitored, documented |

---

## First Actions (on go-ahead)
1. `P0-1 → P0-8` — stand up the monorepo, tooling, and both apps.
2. `P1-1 → P1-12` — design system + `/_styleguide`.
3. `P2` + `P3` auth & first public endpoints.
4. `P4-H*` — build the **Home page vertical slice** end-to-end to validate the full stack.
