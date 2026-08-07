/**
 * Public route caching strategy (P6-2)
 *
 * - `(public)/layout.tsx` sets `revalidate = 60` — ISR default for marketing pages.
 * - `lib/api.ts` server fetches use `next: { revalidate: 60 }` (overridable per call).
 * - Product / news detail routes use `generateStaticParams` + the same ISR window.
 * - Mutations (quotation request, contact) pass `revalidate: false` (no-store).
 * - Admin routes use `cache: 'no-store'` via `lib/admin-api.ts`.
 * - Bundle audit: `ANALYZE=true pnpm --filter @rivet/web build`
 * - Package import optimization: lucide-react, framer-motion, recharts (next.config).
 */

export const PUBLIC_REVALIDATE_SECONDS = 60;
export const SITEMAP_REVALIDATE_SECONDS = 3600;
