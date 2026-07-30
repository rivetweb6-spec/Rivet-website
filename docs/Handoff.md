# RIVET — Client Handoff Guide

> For the RIVET / River Company team. How to swap in your real brand assets and
> how to run the site day-to-day from the Admin control room. For deployment and
> environment details, see [`Deployment.md`](./Deployment.md).

---

## 1. Quick reference

| Thing | Where |
|---|---|
| Public website | your Vercel URL (e.g. `https://rivet.vercel.app`) |
| Admin dashboard | `/admin` on the same URL |
| First login | `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (change the password immediately) |
| API | your Render/Railway URL + `/api` |

---

## 2. Swapping placeholder assets

The site currently uses high-quality royalty-free placeholders. Swapping in real
assets requires **no layout changes** because every container uses fixed aspect
ratios and all imagery is referenced through a single manifest.

### 2.1 Images (hero, categories, products, news)

Edit the one manifest file: `apps/web/lib/assets.ts`.

```ts
export const assets = {
  hero: {
    image: 'https://res.cloudinary.com/<cloud>/image/upload/rivet/hero.jpg',
    poster: 'https://res.cloudinary.com/<cloud>/image/upload/rivet/hero-poster.jpg',
  },
  // ...replace each URL with your Cloudinary (or hosted) asset URL
};
```

- Replace each placeholder URL with your real asset URL. Keep the **keys** the
  same — components reference semantic keys, never raw paths.
- Cloudinary and Unsplash URLs are automatically optimized (format, width,
  quality) by `apps/web/lib/cloudinary-loader.ts`.
- Most catalog imagery (products, categories, news) is better managed through the
  **Admin dashboard** (§3) rather than this file — the manifest is for the fixed
  marketing surfaces (hero, editorial intros).

### 2.2 Logo

Edit `apps/web/components/site/logo.tsx`. Replace the text wordmark with your
official SVG/`<Image>`, keeping a similar width/height footprint so the navbar
and footer layout stay intact.

### 2.3 Brand colors & type

Brand tokens (Navy `#002F54`, Gold `#D69A2E`, type scale, radii, shadows) live in
the design-token layer. Adjust there if brand guidelines change — everything
inherits automatically. Contrast is validated by `pnpm contrast` and unit tests.

### 2.4 Company & contact details

Manage from the Admin dashboard → **Company Information** and **Contact
Information** (address, phone, email, WhatsApp, socials, map coordinates). No code
change needed.

---

## 3. Admin user guide

Sign in at `/admin`. The sidebar (navy, gold active indicator) gives access to
every module. Changes are saved to the database and appear on the public site.

### 3.1 First steps
1. Log in with the seeded credentials.
2. Go to **Profile** → change your password.
3. Fill in **Company Information** and **Contact Information**.

### 3.2 Products & Categories
- **Categories:** create the product departments (Elevators, Granite, …) and set
  their display order. Products must belong to a category.
- **Products:** create/edit products with specs, features, brand, origin, and
  description. Upload multiple images and **drag to reorder** (the first image is
  the cover). Toggle **Featured** to show a product on the home page. Set status
  **Draft/Published** to control visibility.

### 3.3 Services
Create service cards (title, narrative, icon, order) shown on the Services page.

### 3.4 News
Write articles with the rich-text editor, add a cover image, and choose
**Draft** or **Publish**. Published articles appear in the News archive and can be
featured on the home page.

### 3.5 Demo Requests (leads)
Every "Request a Private Demo" submission from the website lands here in
real time — a **live badge** appears in the topbar when a new request arrives.
- Move a lead through its status: New → Contacted → Scheduled → Completed / Closed.
- Add internal **admin notes**.
- **Export** the list to CSV/Excel for your sales team.

### 3.6 Dashboard
The landing page shows overview cards and charts (products, leads, activity) so
you can see the state of the business at a glance.

---

## 4. Content publishing checklist

- [ ] Company + Contact info completed
- [ ] Categories created and ordered
- [ ] Products added, images uploaded, a few marked Featured, status Published
- [ ] Services added
- [ ] 2–3 News articles Published
- [ ] Hero + logo assets swapped in code (§2.1, §2.2)
- [ ] Admin password changed; extra admin users created if needed

---

## 5. Testing & quality (for developers)

| Command | What it does |
|---|---|
| `pnpm test` | Unit tests (Vitest) for web + api |
| `pnpm test:e2e` | Playwright E2E (needs running stack + seeded DB) |
| `pnpm lint` / `pnpm typecheck` | Static checks |
| `pnpm build` | Production build of both apps |
| `pnpm contrast` | WCAG contrast audit of brand pairs |
| `pnpm smoke` | Post-deploy smoke tests (set `API_URL`/`SITE_URL`) |

See [`Deployment.md`](./Deployment.md) for CI/CD, hosting, and monitoring.
