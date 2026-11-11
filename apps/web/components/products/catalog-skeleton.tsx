import { Skeleton } from '@/components/ui/skeleton';

/**
 * Placeholder for the /products catalog while its data loads: the search row,
 * a section heading and one row of cards, matching the real layout so the
 * page doesn't jump when it arrives.
 */
export function CatalogSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading products…</span>
      <div className="mb-12 flex flex-col gap-4 md:mb-14 lg:flex-row lg:items-center lg:justify-between">
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-12 w-full lg:max-w-sm" />
      </div>
      <div className="mb-8 border-b border-border pb-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-8 w-64" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-[8px] border border-border">
            <Skeleton className="aspect-[16/10] rounded-none" />
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
