# RIVET — River Company Luxury Digital Flagship
## Implementation Plan

> A phased engineering roadmap to build the public showroom website and the admin
> control room, faithful to the RIVET brand system (Navy `#002F54`, Gold `#D69A2E`),
> with cinematic motion, enterprise-grade CMS, and Lighthouse 90+ targets.

---

## 1. Guiding Principles

- **Brand-first**: The color and type system is enforced through design tokens — no ad-hoc hex values anywhere in the codebase.
- **Performance is luxury**: SSR/ISR by default, image optimization, code-splitting, and a strict performance budget. Motion never blocks interactivity.
- **Editorial over templated**: Asymmetric grids, generous whitespace, hairline dividers, restrained gold.
- **Accessibility is non-negotiable**: WCAG 2.1 AA, keyboard-first, reduced-motion support.
- **One source of truth**: Content lives in PostgreSQL, managed via the Admin Dashboard, served through a typed API.

---

## 2. Architecture Overview

```
rivet/  (monorepo, pnpm workspaces)
├── apps/
│   ├── web/          # Next.js (App Router) — public site + admin UI
│   └── api/          # Node + Express + TypeScript — REST API
├── packages/
│   ├── ui/           # Shared shadcn/ui components + brand tokens
│   ├── config/       # ESLint, TS, Tailwind preset, Prettier
│   └── types/        # Shared TypeScript types / zod schemas
├── prisma/           # schema.prisma, migrations, seed
└── docs/
```

### Stack Decisions
| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | SSR/ISR, RSC, route handlers |
| Styling | Tailwind CSS + shadcn/ui | Brand tokens as CSS variables |
| Motion | Framer Motion + GSAP + Lenis | FM for components, GSAP+ScrollTrigger for scroll sequences |
| Icons | Lucide React | Line-art style |
| Backend | Node + Express + TypeScript | Separate deployable API |
| DB / ORM | PostgreSQL + Prisma | Managed Postgres |
| Auth | JWT + bcrypt | httpOnly cookies, refresh tokens |
| Media | Cloudinary | Multi-image upload, on-the-fly transforms, blur placeholders |
| Validation | Zod | Shared front/back schemas |
| Deploy | Vercel (web) · Railway/Render (api) · Managed Postgres | |

> **Note on architecture choice**: The brief specifies a separate Express backend. An
> alternative is an all-Next.js build (route handlers + server actions) which is simpler
> to deploy and lower-latency. I default to the **separate Express API** per the brief,
> but this is the one decision worth confirming — see §12 Open Questions.

---

## 3. Design System Foundation (Phase 0)

Build this before any pages so every screen inherits the brand automatically.

- **Design tokens** (`packages/ui` + Tailwind preset):
  - Colors: `navy #002F54`, `gold #D69A2E`, `ink #1E1E1E`, `white`, plus neutrals
    (`bg #F7F8FA`, `border #E5E7EB`, `divider #E2E8F0`, `muted #64748B`) and semantic
    (`success #16A34A`, `warning #F59E0B`, `error #DC2626`).
  - Radius scale: `12 / 16 / 20px`.
  - Shadow scale: multi-stop, low-opacity layered shadows (sm/md/lg/bloom).
  - Type scale: `12 / 14 / 16 / 20 / 28 / 40 / 56 / 72px`, tracking + line-height rules.
  - Spacing rhythm: section padding `96–140px` desktop.
- **Fonts**: Poppins/Montserrat (display) + Inter (body/eyebrow) via `next/font`.
- **Primitives**: Button (with ripple/ink + gold hover), Card (lift + gold hairline on hover), Eyebrow label, Section wrapper, Container, Divider (1px hairline), Input/Field with refined error state.
- **Motion primitives**: `FadeUp`, `Stagger`, `Parallax`, `CountUp`, `Reveal` wrappers; global Lenis smooth-scroll provider; `prefers-reduced-motion` guard.
- **Storybook (optional)** to review components in isolation.

**Deliverable**: A living style guide route (`/_styleguide`) showing every token and component.

---

## 4. Data Model (Prisma) — Phase 1

Core entities and relations:

- **User** — id, name, email, passwordHash, role (`ADMIN`), avatar, timestamps.
- **Category** — id, name, slug, description, image, order, timestamps.
- **Product** — id, name, slug, categoryId, shortDesc, description, brand, countryOfOrigin, specs (JSON), features (JSON), images (relation), featured (bool), status (DRAFT/PUBLISHED), timestamps.
- **ProductImage** — id, productId, url, publicId, alt, order.
- **Service** — id, title, slug, narrative, icon, image, order, status.
- **NewsArticle** — id, title, slug, excerpt, body (rich text), coverImage, category, publishedAt, status, timestamps.
- **DemoRequest** — id, fullName, company?, email, phone, productInterest, message?, status (NEW/CONTACTED/SCHEDULED/COMPLETED/CLOSED), adminNotes?, createdAt.
- **CompanyInfo** — singleton: history, vision, mission, coreValues (JSON), timeline (JSON), achievements, certifications.
- **ContactInfo** — singleton: address, phone, email, whatsapp, facebook, linkedin, telegram, mapLat, mapLng.
- **ContactMessage** — id, name, email, phone?, message, createdAt.

**Deliverables**: `schema.prisma`, initial migration, seed script with realistic demo content and one admin user.

---

## 5. Backend API (Express) — Phase 2

- **Structure**: routes → controllers → services → Prisma. Zod validation middleware, centralized error handler, request logging (pino), Helmet, CORS, rate limiting.
- **Auth**: `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me` — bcrypt hashing, JWT access (short-lived) + refresh (httpOnly cookie).
- **Public (read) endpoints**: categories, products (with search/filter/pagination), product by slug, related products, services, news (list/detail/filter), company info, contact info; `POST /demo-requests`, `POST /contact`.
- **Admin (protected) endpoints**: full CRUD for products (+ multi-image upload to Cloudinary), categories, services, news, company info, contact info; demo request list + status/notes update; CSV/Excel export; dashboard analytics aggregation.
- **Media**: Cloudinary signed uploads, generate blur placeholders on upload.
- **Realtime**: SSE or WebSocket channel for new demo-request notifications (live badge).

**Deliverables**: Documented REST API (OpenAPI/Postman), typed client in `packages/types`.

---

## 6. Public Website — Phase 3

Build order (each page ships with SEO metadata, motion, responsive breakpoints):

1. **Global shell**: Sticky nav (transparent-over-hero → frosted/navy on scroll), expandable search overlay, always-visible gold **Request Demo** CTA, Navy footer with gold hover links, mobile menu.
2. **Home**:
   - Cinematic hero (looping video/image sequence, navy gradient overlay, staggered headline reveal, tiered CTAs, pulsing scroll cue).
   - Company introduction (editorial split layout).
   - Product categories gallery (hover crossfade + zoom + gold underline).
   - Featured products (asymmetric magazine grid, hover lift/zoom/hairline).
   - Services (icon-led cards).
   - Why Choose RIVET (animated line-art icon cards, navy→gold hover).
   - Statistics band (full-width navy, animated counters on viewport entry, faint line-drawing motif).
   - Latest news (editorial cards, shared-element transition to article).
   - **Request a Private Demo** section + modal.
3. **Products** — search, filters, category select, responsive grid, pagination (boutique sort panel feel).
4. **Product Detail** — zoom/drag gallery, specs, features, brand, origin, description, related, inquiry button.
5. **Services** — narrative cards.
6. **Company** — history, vision, mission, core values, scroll-driven animated timeline, achievements, certifications.
7. **News** — filterable editorial archive + full article view.
8. **Contact** — form, brand-styled Google Map, address, clickable phone/email, WhatsApp/Facebook/LinkedIn/Telegram.

### Request a Demo (Lead Gen)
- Modal fields: Full Name*, Company, Email*, Phone*, Product Interest (dropdown), Message.
- Real-time inline validation (refined error state), save to DB, designed success moment, optional redirect to demo video.
- Instant appearance in Admin with live notification badge.

---

## 7. Admin Dashboard — Phase 4

- **Auth gate**: login screen, protected layout, session handling, logout.
- **Layout**: Navy sidebar (white text, gold active indicator), calm white content cards with layered shadows, topbar with notification badge + profile.
- **Modules**:
  - Dashboard analytics (overview cards + interactive charts — Recharts/visx).
  - Products (CRUD + multi-image upload + drag-reorder).
  - Categories (CRUD + ordering).
  - News (rich-text editor, publish/draft).
  - Services (CRUD).
  - Company Information (singleton editor incl. timeline builder).
  - Contact Information (singleton editor).
  - Demo Requests (table, status workflow, admin notes, live badge, CSV/Excel export).
  - User Profile.
- **UX**: skeleton loaders, optimistic updates, toast confirmations, empty states, confirm dialogs.

---

## 8. Motion & Interaction Layer (cross-cutting)

- Lenis smooth scroll globally; GSAP ScrollTrigger for section reveals and timeline.
- Framer Motion for component-level orchestration, page transitions, modals.
- Signature moments: hero parallax + stagger, card hover lift + gold hairline + shadow bloom, image zoom (1.04–1.08), animated counters, ripple buttons, blur-up lazy images, drag-to-explore gallery with inertia.
- **Every animation respects `prefers-reduced-motion`** and never delays LCP/interactivity.

---

## 9. Performance, SEO & Accessibility — Phase 5

- SSR/ISR per page; `next/image` with Cloudinary loader + blur placeholders; route-level code splitting.
- SEO-friendly slugs, dynamic metadata, Open Graph/Twitter cards, `sitemap.xml`, `robots.txt`, Schema.org (Organization, Product, Article, BreadcrumbList).
- Accessibility pass: semantic landmarks, focus states, ARIA, color-contrast validation, keyboard nav, reduced motion.
- Performance budget + Lighthouse CI in the pipeline; target 90+ across all four categories.

---

## 10. Quality, CI/CD & Deployment — Phase 6

- **Tooling**: ESLint + Prettier + strict TS, Husky pre-commit, commitlint.
- **Testing**: Vitest (unit), Playwright (e2e for key flows: demo request, admin CRUD, auth), API integration tests.
- **CI (GitHub Actions)**: lint → typecheck → test → build → Lighthouse CI.
- **Deploy**: Vercel (web) with preview deployments; Railway/Render (api); managed PostgreSQL; Cloudinary; environment/secret management; DB migration step on deploy.
- **Monitoring**: error tracking (Sentry), uptime, basic analytics.

---

## 11. Phased Timeline (indicative)

| Phase | Scope | Est. |
|---|---|---|
| 0 | Repo, tooling, design system + tokens | 1 wk |
| 1 | Prisma schema, migrations, seed | 3–4 days |
| 2 | Express API + auth + Cloudinary + realtime | 1.5 wks |
| 3 | Public website (all pages + motion) | 2.5–3 wks |
| 4 | Admin dashboard (all modules) | 2–2.5 wks |
| 5 | Performance, SEO, accessibility hardening | 1 wk |
| 6 | Testing, CI/CD, deployment | 1 wk |

> ~9–10 weeks for a single focused developer; compressible with parallel work on web/api.

---

## 12. Confirmed Decisions

1. **Backend** — ✅ Separate **Node + Express + TypeScript** REST API with PostgreSQL, decoupled from Next.js. Chosen for scalability and future expansion.
2. **Repository** — ✅ **Monorepo** (pnpm workspaces): `apps/web`, `apps/api`, `packages/{ui,types,config,utils}`, `prisma/`, `docs/`.
3. **Language** — ✅ **English only** for v1, but **architected with i18n from day one** (next-intl) so Amharic/others drop in later with no structural change.
4. **Assets** — ✅ Client provides logo, brand colors, product/company imagery, company info, contact details. Until then, use **high-quality royalty-free placeholders** + a construction/architecture/elevator hero, structured so swapping real assets requires **no layout changes**.
5. **News editor** — Tiptap rich-text (default).
6. **Auth scope** — Single `ADMIN` role now; schema leaves room for roles later.

> Full design system, folder layout, i18n strategy, placeholder strategy, and the exact
> build sequence are detailed in **`docs/Design_and_Steps.md`**.

---

## 13. Immediate Next Steps

1. Confirm the §12 decisions.
2. Scaffold the monorepo + tooling + Tailwind brand preset.
3. Implement design tokens and core UI primitives (`/_styleguide`).
4. Define `schema.prisma` and seed baseline content.
5. Stand up the API auth + first public endpoints, then build the Home page end-to-end as the vertical slice that proves the whole stack.
