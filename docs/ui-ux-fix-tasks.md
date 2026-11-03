# RIVET UI/UX Fix Tasks

Source: UI/UX audit findings produced for this project (public + admin).

**Completed (do not re-open):**

- UX-01 — Homepage hero “Request a Quotation” CTA contrast
- UX-02 — Close mobile drawer before opening quotation modal
- UX-03 — Footer “Privacy Policy” / “Terms” link to Contact

**Remaining work starts at UX-04.** Implement one task at a time.

---

## UX-04 — Search overlay: no scroll lock, no loading UI, silent failures

### Priority
High

### Problem
The header search overlay does not lock body scroll (unlike the mobile drawer and quotation modal). A `loading` flag is set but never rendered. Suggestion fetch failures are swallowed with no user message. The close control is icon-only without a ≥40px hit area.

### Expected Fix
While search is open, lock and restore `document.body` overflow. Show a visible loading state during suggestions. Surface a brief error on failed fetches. Enlarge the close control to a comfortable touch target (~40×40).

### Scope
`apps/web/components/site/navbar.tsx` (`SearchOverlay`)

### Acceptance Criteria
- Background page does not scroll while search is open; scroll restores on close/unmount.
- Pending suggestions show visible feedback.
- Failed suggestion requests show a short error message.
- Close control is easy to tap on mobile.

### Verification
- typecheck
- tests
- git diff --check
- Manually open search on mobile/desktop: scroll locked; loading/error visible; close usable

### Status
Completed

---

## UX-05 — Confusing dual quotation CTAs (“modal” vs “Quotation page”)

### Priority
Medium

### Problem
Product and service surfaces expose adjacent actions: a modal “Request a Quotation” button and a link labeled **“Quotation page”**. Users cannot tell which path to use; “Quotation page” reads as implementation jargon.

### Expected Fix
Keep one clear primary quotation action. Clarify or remove the secondary path (e.g. “Open full quotation form” / “Prefer a full page?”), or drop the duplicate.

### Scope
Product/service pages (e.g. `apps/web/app/(public)/products/[slug]/page.tsx`, `apps/web/app/(public)/services/page.tsx`, `apps/web/app/(public)/services/[slug]/page.tsx`) and `apps/web/components/quotation/request-quotation-button.tsx` as needed

### Acceptance Criteria
- Users see a clear primary quotation path without jargon labels.
- Modal and/or full-page behaviors remain intentional and understandable.
- No unrelated CTA redesign elsewhere.

### Verification
- typecheck
- tests
- git diff --check
- Spot-check product and services pages for CTA copy/clarity

### Status
Completed

---

## UX-06 — `/request-quotation` double top clearance under fixed header

### Priority
Medium

### Problem
The request-quotation page uses a breadcrumb strip with `pt-28 md:pt-32`, then `PageHero` adds another large `pt-36 md:pt-44` clearance meant for heroes that sit directly under the fixed nav. Result: a large empty navy band above the title.

### Expected Fix
Use a single clearance path: put breadcrumbs inside/over the hero, or use a compact hero without the second header offset.

### Scope
`apps/web/app/(public)/request-quotation/page.tsx`, `apps/web/components/site/page-hero.tsx` (only if needed without breaking other heroes)

### Acceptance Criteria
- Title/eyebrow sit at a normal distance under the fixed header.
- No large empty double-padding band.
- Other pages using `PageHero` remain correct if shared component is touched.

### Verification
- typecheck
- tests
- git diff --check
- Visual check of `/request-quotation` at mobile and desktop widths

### Status
Completed

---

## UX-07 — Public forms: weak error association & no focus management

### Priority
Medium

### Problem
Quotation and careers form fields lack `aria-invalid` / `aria-describedby` (contact inputs are better). Submit errors are plain text without `role="alert"`. Failed submit does not move focus to the first invalid field. Quotation/careers lack solid `autoComplete` (contact has it).

### Expected Fix
Align quotation and careers fields with the contact form’s invalid/describedby pattern. Add `role="alert"` on submit errors. Focus the first invalid field on failed validation. Add appropriate autocomplete attributes.

### Scope
`apps/web/components/quotation/quotation-form.tsx`, `apps/web/components/quotation/quotation-modal.tsx`, `apps/web/components/careers/application-form.tsx`, `apps/web/components/contact/contact-form.tsx` (parity only)

### Acceptance Criteria
- Invalid fields expose `aria-invalid` and linked error text.
- Submit errors are announced via an alert role.
- After validation failure, focus moves to the first invalid control.
- Key fields support browser autofill where appropriate.

### Verification
- typecheck
- tests
- git diff --check
- Keyboard/AT spot-check on quotation and careers forms

### Status
Completed

---

## UX-08 — Careers CV control not programmatically labeled

### Priority
Medium

### Problem
The CV file input is `sr-only` without a proper `id` / label association. The visible “Upload…” control is a separate button not tied to the required CV label via `htmlFor` / `aria-labelledby`.

### Expected Fix
Associate the file input with the CV label (`id` + `htmlFor` / `aria-labelledby`), or make the dashed upload control a `<label htmlFor=…>`.

### Scope
`apps/web/components/careers/application-form.tsx`

### Acceptance Criteria
- Assistive tech exposes the CV control as the required upload field.
- Visible upload affordance still works for mouse/touch users.

### Verification
- typecheck
- tests
- git diff --check
- Inspect CV control labeling in the careers application form

### Status
Completed

---

## UX-09 — Mobile nav / search / lightbox: incomplete focus trapping

### Priority
Medium

### Problem
Mobile drawer and search dialog only handle Escape/backdrop; Tab can leave into the page behind. Lightbox has Escape/arrows but no focus trap or reliable initial focus. The quotation modal already implements Tab trapping correctly.

### Expected Fix
Add focus trap + focus restore patterned after the quotation modal for search and lightbox (and optionally the mobile drawer). Optionally keep header actions from competing while the drawer is open.

### Scope
`apps/web/components/site/navbar.tsx`, `apps/web/components/company/image-lightbox.tsx`

### Acceptance Criteria
- While search/lightbox (and drawer if included) are open, Tab cycles within the overlay.
- Focus returns to the opener on close.
- Escape and backdrop/close behavior still work.

### Verification
- typecheck
- tests
- git diff --check
- Keyboard Tab/Escape check on search, lightbox, and drawer if changed

### Status
Completed

---

## UX-10 — Services index has no empty state

### Priority
Medium

### Problem
`/services` maps `services` with no empty branch (unlike careers/gallery/news). An empty CMS catalog yields a blank grid plus only the bottom CTA.

### Expected Fix
Add an empty panel with Contact / Request quotation recovery, mirroring careers-style empty UX.

### Scope
`apps/web/app/(public)/services/page.tsx`

### Acceptance Criteria
- When there are no services, users see clear empty copy and a recovery path.
- Non-empty catalogs render unchanged.

### Verification
- typecheck
- tests
- git diff --check
- Confirm empty-branch UI exists in code path for `services.length === 0`

### Status
Pending

---

## UX-11 — Category product empty state has no recovery path

### Priority
Medium

### Problem
Category product pages change the heading to “No published products…” but offer no CTA. The main catalog empty state already provides recovery chips / “View all”.

### Expected Fix
Add recovery links (e.g. `/products`, related services, or quotation) when a category has no products.

### Scope
`apps/web/components/products/category-page.tsx`

### Acceptance Criteria
- Empty category pages are not a dead end.
- Populated category pages remain unchanged.

### Verification
- typecheck
- tests
- git diff --check
- Inspect empty-state markup for recovery links

### Status
Pending

---

## UX-12 — Products catalog search input unlabeled

### Priority
Medium

### Problem
The products catalog search `<input>` has a placeholder only — no `<label>` / `aria-label` (navbar search already uses `aria-label="Search products"`).

### Expected Fix
Add an `aria-label` or visible label for the catalog search field.

### Scope
`apps/web/components/products/catalog.tsx`

### Acceptance Criteria
- The search control has an accessible name independent of placeholder alone.

### Verification
- typecheck
- tests
- git diff --check
- Confirm label/`aria-label` on the catalog search input

### Status
Pending

---

## UX-13 — Hardcoded footer deep links may 404

### Priority
Medium

### Problem
Footer product/service links use static slugs (e.g. `/products/elevators`, `/services/elevator-installation`) not driven by CMS categories/services. Slug renames can 404 while live nav stays correct.

### Expected Fix
Build footer columns from API data with safe fallbacks, or only link to top-level `/products` and `/services`.

### Scope
`apps/web/components/site/footer.tsx` (and parent data wiring if needed)

### Acceptance Criteria
- Footer links no longer depend on brittle hardcoded CMS slugs, or only use stable top-level routes.
- Existing company/contact/quotation footer links remain valid.

### Verification
- typecheck
- tests
- git diff --check
- Review footer link sources against live catalog strategy

### Status
Pending

---

## UX-14 — Contact “Office & channels” can be empty

### Priority
Low

### Problem
Address/phone/email render only when present; there is no fallback copy when all are missing. The map still defaults to an Addis Ababa embed.

### Expected Fix
Add fallback messaging and emphasize the contact form when channels are unset.

### Scope
`apps/web/app/(public)/contact/page.tsx`

### Acceptance Criteria
- Missing contact channels do not leave an empty “Office & channels” section without explanation.
- Form remains usable as the primary path.

### Verification
- typecheck
- tests
- git diff --check

### Status
Pending

---

## UX-15 — Quotation modal initial focus on Close

### Priority
Low

### Problem
On open, the quotation modal focuses the close button (`closeBtnRef`), not the first field.

### Expected Fix
Focus the first text field on open while keeping Escape/close available.

### Scope
`apps/web/components/quotation/quotation-modal.tsx`

### Acceptance Criteria
- Opening the modal places keyboard focus in the first meaningful field.
- Close and Escape still work; focus trap remains intact.

### Verification
- typecheck
- tests
- git diff --check
- Keyboard open modal and confirm initial focus target

### Status
Completed

---

## UX-16 — Product gallery uses incomplete `tablist` pattern

### Priority
Low

### Problem
Thumbnails use `role="tab"` inside `tablist` without `tabpanel`, `aria-controls`, or arrow-key tab behavior.

### Expected Fix
Use a toolbar/radiogroup pattern, or implement full tabs with panels and arrow keys.

### Scope
`apps/web/components/products/gallery.tsx`

### Acceptance Criteria
- Gallery controls use a coherent, complete ARIA pattern (no incomplete tablist).
- Image switching still works for pointer users.

### Verification
- typecheck
- tests
- git diff --check

### Status
Pending

---

## UX-17 — Company subnav: horizontal scroll with hidden scrollbar

### Priority
Low

### Problem
Company subnav uses `overflow-x-auto` with the scrollbar fully hidden, so overflow chips may be undiscoverable on narrow screens.

### Expected Fix
Add a fade hint, a visible thin scrollbar, or wrap chips so overflow is discoverable.

### Scope
`apps/web/components/company/company-subnav.tsx`

### Acceptance Criteria
- On narrow viewports, users can tell when more company links exist off-screen (or all links wrap visibly).

### Verification
- typecheck
- tests
- git diff --check
- Visual check at ~320–390px width

### Status
Pending

---

## UX-18 — Hero packs three peer CTAs

### Priority
Low

### Problem
The homepage hero presents equal-weight Explore Products, Request a Quotation, and Contact Us actions, diluting the primary action (especially when wrapped on mobile).

### Expected Fix
Keep one primary and one secondary action; demote Contact to a text link or quieter treatment without inventing new brand colors.

### Scope
`apps/web/components/home/hero.tsx`

### Acceptance Criteria
- Hero CTA hierarchy is clearer (primary vs secondary vs tertiary).
- Quotation and Explore behaviors remain available.
- Contrast of quotation CTA remains sufficient (UX-01 already fixed).

### Verification
- typecheck
- tests
- git diff --check
- Visual check of hero CTA group on mobile and desktop

### Status
Pending

---

## UX-19 — Mobile Company submenu links undersized tap targets

### Priority
Low

### Problem
Company submenu links use `py-2.5` with smaller type (~34px hit height), below the common ~44px mobile target; the parent “Company” row is fine.

### Expected Fix
Increase submenu item padding/min-height to match primary drawer links (`py-4` or min-height 44px).

### Scope
`apps/web/components/site/company-menu.tsx` (`MobileCompanyMenu`)

### Acceptance Criteria
- Company submenu items meet a comfortable mobile tap size without changing destinations.

### Verification
- typecheck
- tests
- git diff --check

### Status
Pending

---

## UX-20 — Nav `gold-underline` affordance is hover-only

### Priority
Low

### Problem
`.gold-underline::after` animates on `:hover` only; there is no `:focus-visible` counterpart for primary nav links that use this class.

### Expected Fix
Add `.gold-underline:focus-visible::after { width: 100%; }` (and optionally `:focus-within` for Company).

### Scope
`apps/web/app/globals.css`, `apps/web/components/site/navbar.tsx` (usage only)

### Acceptance Criteria
- Keyboard focus shows the same underline cue mouse users get on hover.

### Verification
- typecheck
- tests
- git diff --check
- Keyboard Tab through desktop nav links

### Status
Pending

---

## UX-21 — Hero “Discover” hash scroll vs Lenis may conflict

### Priority
Low

### Problem
Hero “Discover” uses `<a href="#intro">` while `SmoothScroll` initializes Lenis without anchor wiring, and `html` also sets `scroll-behavior: smooth`. Reduced-motion users skip Lenis (OK), but Lenis-enabled browsers can get unreliable in-page jumps.

### Expected Fix
Intercept in-page anchors with `lenis.scrollTo('#intro')`, or use a button + `scrollIntoView` when Lenis is active.

### Scope
`apps/web/components/home/hero.tsx`, `apps/web/components/providers/smooth-scroll.tsx`

### Acceptance Criteria
- Activating Discover scrolls reliably to the intro section when Lenis is active.
- Reduced-motion path remains respectful.

### Verification
- typecheck
- tests
- git diff --check
- Click Discover on homepage with default motion settings

### Status
Pending

---

# Admin UI / Accessibility Tasks

From the admin UI/accessibility audit. Preserve ADM IDs and severity.

---

## ADM-01 — Admin modal: no focus trap / no focus restore

### Priority
High

### Problem
`AdminModal` has Escape and body scroll lock, but Tab is not trapped and focus is not moved into/out of the dialog. Public `QuotationModal` already implements trap + restore.

### Expected Fix
Port the Tab-cycle + initial-focus + restore pattern from `quotation-modal.tsx` into `AdminModal`.

### Scope
`apps/web/components/admin/ui.tsx` (`AdminModal`)

### Acceptance Criteria
- Tab cycles within an open admin modal.
- Focus moves into the modal on open and restores on close.
- Escape and backdrop close still work.

### Verification
- typecheck
- tests
- git diff --check
- Keyboard Tab/Escape on a representative admin CRUD modal

### Status
Completed

---

## ADM-02 — Admin modals almost never named via `aria-labelledby`

### Priority
High

### Problem
`labelledBy` is optional; most admin dialogs render an `<h2>` but never wire `id` → `aria-labelledby`. Categories delete modal is a good exception.

### Expected Fix
Require `labelledBy` (or auto-id the title) and update modal call sites.

### Scope
`apps/web/components/admin/ui.tsx` and admin dashboard modal call sites (e.g. products, news, vacancies)

### Acceptance Criteria
- Open admin dialogs expose a reliable accessible name via `aria-labelledby` (or equivalent).

### Verification
- typecheck
- tests
- git diff --check
- Spot-check multiple admin modals for labelled titles

### Status
Completed

---

## ADM-03 — Mobile admin drawer missing dialog pattern

### Priority
High

### Problem
Admin mobile drawer is a fixed panel + backdrop without Escape, focus trap, `role="dialog"`/`aria-modal`, or menu `aria-expanded`/`aria-controls`. Public navbar has Escape + expanded/controls.

### Expected Fix
Match public mobile nav patterns: Escape, `aria-expanded`/`aria-controls`, focus first link on open, restore focus on close; optionally treat as dialog.

### Scope
`apps/web/components/admin/shell.tsx`

### Acceptance Criteria
- Mobile admin menu can be dismissed with Escape.
- Expanded state is exposed to AT.
- Focus is managed predictably while open.

### Verification
- typecheck
- tests
- git diff --check
- Keyboard check of admin shell on a narrow viewport

### Status
Pending

---

## ADM-04 — Admin form controls suppress visible focus ring

### Priority
High

### Problem
`AdminInput` / `AdminTextarea` / `AdminSelect` use `outline-none`, overriding global gold `:focus-visible` rings. Only `focus:border-navy` remains.

### Expected Fix
Drop `outline-none` or replace with focus-visible outline/ring utilities matching the global gold ring. Align image-upload URL fields if they share the same issue.

### Scope
`apps/web/components/admin/ui.tsx`, `apps/web/components/admin/image-upload-field.tsx` as needed

### Acceptance Criteria
- Focused admin form controls show a clear visible focus indicator.

### Verification
- typecheck
- tests
- git diff --check
- Keyboard Tab through admin form fields

### Status
Pending

---

## ADM-05 — Save/upload errors render behind open modals

### Priority
High

### Problem
Many admin pages render `{error && …}` outside `<AdminModal>`. While the modal is open (`z-[200]`), page-level errors sit under the backdrop and are invisible.

### Expected Fix
Render errors inside the modal and/or use `aria-live="assertive"`.

### Scope
Admin dashboard pages that save/upload inside modals (e.g. products, news, vacancies, team, gallery, certificates, services, categories, quotations)

### Acceptance Criteria
- When a save/upload fails with a modal open, the error is visible without closing the modal.
- Successful flows remain unchanged.

### Verification
- typecheck
- tests
- git diff --check
- Code review that error UI is inside modal surfaces

### Status
Pending

---

## ADM-06 — Gold text links fail WCAG AA contrast

### Priority
High

### Problem
Gold `#d69a2e` on light surface/bg is about **2.3:1** (needs 4.5:1 for body/link text). Used for text links such as dashboard “View all”.

### Expected Fix
Use navy for default link text; reserve gold for hover/large accents, or darken gold for text use—without inventing a new brand system beyond token adjustments needed for readable text.

### Scope
`apps/web/app/globals.css` tokens as needed; admin call sites using `text-gold` for body/link text (e.g. dashboard, company admin)

### Acceptance Criteria
- Default text links meet AA contrast on light backgrounds.
- Brand gold remains available for accents/hover where contrast is acceptable.

### Verification
- typecheck
- tests
- git diff --check
- Contrast check of updated link styles

### Status
Pending

---

## ADM-07 — No skip link / labeled main id in admin

### Priority
Medium

### Problem
Public layout has skip link + `#main-content`. Admin shell’s `<main>` has no `id` and no skip control, though skip-link CSS exists globally.

### Expected Fix
Add a skip link and `id="main-content" tabIndex={-1}` on admin `<main>`.

### Scope
`apps/web/components/admin/shell.tsx`

### Acceptance Criteria
- Keyboard users can skip to admin main content.

### Verification
- typecheck
- tests
- git diff --check

### Status
Pending

---

## ADM-08 — List pages flash empty state while loading

### Priority
Medium

### Problem
Many admin list pages treat `length === 0` as empty with no `loading` flag, so the initial fetch flashes an empty state.

### Expected Fix
Shared `loading | empty | data` states with skeleton/`aria-busy`.

### Scope
Admin list pages (products, categories, news, quotations, vacancies, team, gallery, certificates, services, contact messages, etc.)

### Acceptance Criteria
- Loading does not look like a permanent empty catalog.
- True empty states still appear after load completes with no rows.

### Verification
- typecheck
- tests
- git diff --check

### Status
Pending

---

## ADM-09 — Notification badge count not exposed accessibly

### Priority
Medium

### Problem
Header Bell uses `aria-label="Notifications"` while unread is only a decorative gold dot; sidebar numeric badges lack an accessible explanation; no `aria-live` for new events.

### Expected Fix
Include unread count in the accessible name; add visually hidden text on sidebar badges; optional polite live region.

### Scope
`apps/web/components/admin/shell.tsx`

### Acceptance Criteria
- Screen-reader users can learn that unread notifications exist and how many (when counted).

### Verification
- typecheck
- tests
- git diff --check

### Status
Pending

---

## ADM-10 — Active nav lacks `aria-current`

### Priority
Medium

### Problem
Admin sidebar uses visual active styles only; no `aria-current="page"` (public catalog pagination already uses it).

### Expected Fix
Set `aria-current={active ? 'page' : undefined}` on nav links.

### Scope
`apps/web/components/admin/shell.tsx`

### Acceptance Criteria
- Current admin location is announced via `aria-current`.

### Verification
- typecheck
- tests
- git diff --check

### Status
Pending

---

## ADM-11 — Vacancies “tabs” are plain buttons

### Priority
Medium

### Problem
`/admin/vacancies` toggles views with two plain buttons and no `tablist` / `tab` / `aria-selected` / `aria-controls` (or `aria-pressed` segmented control).

### Expected Fix
Implement a proper tabs pattern or a segmented control with `aria-pressed`.

### Scope
`apps/web/app/admin/(dashboard)/vacancies/page.tsx`

### Acceptance Criteria
- Vacancy view switcher exposes correct selection semantics to AT.

### Verification
- typecheck
- tests
- git diff --check

### Status
Pending

---

## ADM-12 — Rich text toolbar: icon-only, no pressed state

### Priority
Medium

### Problem
Rich text toolbar buttons are icon-only without `aria-label`; active state is visual only (no `aria-pressed`). Editor surface lacks an accessible name; loading placeholder is a silent pulse.

### Expected Fix
Add labels + `aria-pressed`; name the editor; use `role="status"` on loading.

### Scope
`apps/web/components/admin/rich-text-editor.tsx`

### Acceptance Criteria
- Toolbar controls are named; pressed/active format state is exposed; loading is announced.

### Verification
- typecheck
- tests
- git diff --check

### Status
Pending

---

## ADM-13 — Login / profile status messages not live regions

### Priority
Medium

### Problem
Login/profile errors and success are plain `<p>` without `role="alert"` / `aria-live` / field `aria-describedby`.

### Expected Fix
Use an alert live region; wire `aria-invalid`/`aria-describedby` on login fields.

### Scope
`apps/web/app/admin/login/page.tsx`, `apps/web/app/admin/(dashboard)/profile/page.tsx`

### Acceptance Criteria
- Auth/profile status messages are announced after submit.
- Invalid login fields are programmatically associated with errors where applicable.

### Verification
- typecheck
- tests
- git diff --check

### Status
Pending

---

## ADM-14 — Sidebar low-contrast secondary text

### Priority
Medium

### Problem
Sidebar secondary text uses `text-white/45` (and similar) on navy (~3.94:1), failing AA for small text.

### Expected Fix
Use ≥ `white/60`–`70` for secondary text on navy.

### Scope
`apps/web/components/admin/shell.tsx`

### Acceptance Criteria
- Secondary sidebar text meets AA contrast for small text on navy.

### Verification
- typecheck
- tests
- git diff --check

### Status
Pending

---

## ADM-15 — Status badge semantic colors fail AA for text

### Priority
Medium

### Problem
`StatusBadge` warning/success (and muted-on-tint) text ratios are below 4.5:1.

### Expected Fix
Darken badge text tokens; do not rely on color alone for meaning.

### Scope
`apps/web/components/admin/ui.tsx` (`StatusBadge`)

### Acceptance Criteria
- Status badge text meets AA contrast on its backgrounds.

### Verification
- typecheck
- tests
- git diff --check

### Status
Pending

---

## ADM-16 — `text-muted` on `bg-bg` slightly under AA

### Priority
Medium

### Problem
`--color-muted: #6b7280` on `--color-bg: #f3f1ec` is about **4.28:1** (passes on surface/canvas).

### Expected Fix
Darken muted (~`#5b6470`) or avoid muted-on-bg pairings.

### Scope
`apps/web/app/globals.css` (and call sites only if needed)

### Acceptance Criteria
- Muted text on `bg` meets AA, or those pairings are avoided.

### Verification
- typecheck
- tests
- git diff --check

### Status
Pending

---

## ADM-17 — Public search dialog: no focus trap

### Priority
Medium

### Problem
Navbar search has Escape + initial focus but no Tab trap / focus restore (quotation modal does). Overlaps UX-09 for search.

### Expected Fix
Reuse the quotation modal focus-trap pattern in `SearchOverlay` (coordinate with UX-09; implement once).

### Scope
`apps/web/components/site/navbar.tsx` (`SearchOverlay`)

### Acceptance Criteria
- Tab does not escape the open search overlay; focus restores on close.

### Verification
- typecheck
- tests
- git diff --check
- Keyboard Tab check on search overlay

### Status
Completed

---

## ADM-18 — Image lightbox: no focus trap

### Priority
Medium

### Problem
Lightbox has dialog semantics + Escape/arrows but no focus containment/restore. Overlaps UX-09 for lightbox.

### Expected Fix
Add trap + initial focus on close (coordinate with UX-09; implement once).

### Scope
`apps/web/components/company/image-lightbox.tsx`

### Acceptance Criteria
- Tab stays within the lightbox while open; focus restores on close.

### Verification
- typecheck
- tests
- git diff --check

### Status
Completed

---

## ADM-19 — Careers form fields missing error ARIA (unlike contact)

### Priority
Medium

### Problem
Careers `Field` lacks `aria-invalid` / `aria-describedby`; CV `sr-only` file input can remain focusable while a separate button triggers it. Overlaps UX-07 / UX-08.

### Expected Fix
Match contact `Field` ARIA; properly name/associate the CV input (coordinate with UX-07/UX-08; implement once).

### Scope
`apps/web/components/careers/application-form.tsx`

### Acceptance Criteria
- Careers field errors and CV control meet the same ARIA quality as contact (and UX-07/UX-08 acceptance).

### Verification
- typecheck
- tests
- git diff --check

### Status
Completed

---

## ADM-20 — Navbar / search Framer Motion ignores reduced motion

### Priority
Medium

### Problem
Navbar drawer/search/quotation Framer Motion paths do not use `useReducedMotion`, while hero/reveal/smooth-scroll do. CSS reduce does not fully stop JS-driven Motion.

### Expected Fix
Use `useReducedMotion()` for instant transitions / skip motion when preferred.

### Scope
`apps/web/components/site/navbar.tsx`, `apps/web/components/quotation/quotation-modal.tsx` as needed

### Acceptance Criteria
- With `prefers-reduced-motion: reduce`, drawer/search/quotation do not play sliding/fading motion that conflicts with the preference.

### Verification
- typecheck
- tests
- git diff --check
- Emulate reduced motion in browser and open drawer/search/modal

### Status
Completed

---

## ADM-21 — Auth gate loading / blank redirect

### Priority
Low

### Problem
`RequireAdmin` shows `"Loading…"` without `role="status"` and can return `null` while redirecting, causing a brief blank screen.

### Expected Fix
Add `role="status"`; keep loading UI until redirect completes.

### Scope
`apps/web/components/admin/auth-provider.tsx`

### Acceptance Criteria
- Auth gate loading is announced; no unexplained blank flash during redirect.

### Verification
- typecheck
- tests
- git diff --check

### Status
Pending

---

## ADM-22 — Unread dots use `aria-label` on plain `<span>`

### Priority
Low

### Problem
Unread indicators use `aria-label` on generic spans, which is often ignored without an appropriate role.

### Expected Fix
Use `role="img"` or visually hidden text (“Unread”).

### Scope
`apps/web/app/admin/(dashboard)/quotation-requests/page.tsx`, vacancies applications UI

### Acceptance Criteria
- “Unread” state is reliably exposed to AT.

### Verification
- typecheck
- tests
- git diff --check

### Status
Pending

---

## ADM-23 — Action columns have empty `<th>`

### Priority
Low

### Problem
Many admin tables use an empty `<th>` for the actions column.

### Expected Fix
`<th><span className="sr-only">Actions</span></th>`.

### Scope
Admin table pages (e.g. products, news, quotations, vacancies)

### Acceptance Criteria
- Actions column has an accessible header name.

### Verification
- typecheck
- tests
- git diff --check

### Status
Pending

---

## ADM-24 — Login email prefilled

### Priority
Low

### Problem
Login initializes email to `admin@rivet.com`, suggesting a known account identity.

### Expected Fix
Start empty (keep `autoComplete="username"`).

### Scope
`apps/web/app/admin/login/page.tsx`

### Acceptance Criteria
- Login email field starts blank in production-ready UX.

### Verification
- typecheck
- tests
- git diff --check

### Status
Pending

---

## ADM-25 — Profile password fields lack `autoComplete`

### Priority
Low

### Problem
Profile current/new password inputs omit `autoComplete="current-password"` / `new-password` (login sets them correctly).

### Expected Fix
Add standard autocomplete attributes.

### Scope
`apps/web/app/admin/(dashboard)/profile/page.tsx`

### Acceptance Criteria
- Password managers can recognize profile password fields.

### Verification
- typecheck
- tests
- git diff --check

### Status
Pending

---

## ADM-26 — Image upload field label not associated

### Priority
Low

### Problem
Image upload group label is a bare `<span>` not tied via `aria-labelledby` / fieldset (drop zone label wrapping the file input is OK).

### Expected Fix
Use `fieldset`/`legend` or `aria-labelledby` on the control group.

### Scope
`apps/web/components/admin/image-upload-field.tsx`

### Acceptance Criteria
- Upload group has a programmatically associated name.

### Verification
- typecheck
- tests
- git diff --check

### Status
Pending

---

## ADM-27 — Dashboard loading skeletons lack status semantics

### Priority
Low

### Problem
Dashboard pulse cards lack `aria-busy`/`role="status"`; error view can replace the entire page without header/retry context.

### Expected Fix
Status region for loading; keep `AdminPageHeader` on error + retry.

### Scope
`apps/web/app/admin/(dashboard)/page.tsx`

### Acceptance Criteria
- Loading is announced; error state keeps recoverable chrome.

### Verification
- typecheck
- tests
- git diff --check

### Status
Pending

---

## ADM-28 — Chart accessibility is partial

### Priority
Low

### Problem
Recharts bar chart is not keyboard/AT accessible; a sibling list helps, but the chart can be redundant noise for AT without `aria-hidden`.

### Expected Fix
`aria-hidden` on the chart SVG container; keep the list as the accessible summary.

### Scope
`apps/web/app/admin/(dashboard)/page.tsx`

### Acceptance Criteria
- Chart decoration is hidden from AT; status counts remain available via the list summary.

### Verification
- typecheck
- tests
- git diff --check

### Status
Pending
