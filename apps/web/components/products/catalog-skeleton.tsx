import { Skeleton } from '@/components/ui/skeleton';

/**
 * Placeholder for the /products catalog while its data loads: a section
 * heading and one row of department cards, matching the real layout so the
 * page doesn't jump when it arrives. (The search box lives in the page
 * header, so it is not repeated here.)
 */
export function CatalogSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading products…</span>
      <div className="mb-8 border-b border-border pb-5">
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-border">
            <Skeleton className="aspect-[3/2] rounded-none" />
            <div className="space-y-3 p-6">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
