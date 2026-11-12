'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoaderCircle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Catalog search box for the /products header. Same behaviour as when it lived
 * inside the catalog: search-as-you-type (debounced), Enter searches at once,
 * the first query pushes a history entry and refinements replace it.
 */
export function CatalogSearch({ className }: { className?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const search = params.get('search') ?? '';
  const [value, setValue] = useState(search);
  const [pending, startTransition] = useTransition();

  // Follow the URL (Back/Forward, "Clear search" in the results).
  useEffect(() => {
    setValue(search);
  }, [search]);

  const go = useCallback(
    (next: string, { replace }: { replace: boolean }) => {
      const sp = new URLSearchParams(params.toString());
      if (next) sp.set('search', next);
      else sp.delete('search');
      sp.delete('page');
      const qs = sp.toString();
      const href = qs ? `/products?${qs}` : '/products';
      startTransition(() => {
        if (replace) router.replace(href, { scroll: false });
        else router.push(href, { scroll: false });
      });
    },
    [params, router],
  );

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed === search) return;
    const timer = window.setTimeout(() => go(trimmed, { replace: Boolean(search) }), 450);
    return () => window.clearTimeout(timer);
  }, [value, search, go]);

  return (
    <form
      role="search"
      className={cn('relative w-full max-w-xl', className)}
      onSubmit={(e) => {
        e.preventDefault();
        go(value.trim(), { replace: false });
      }}
    >
      <label htmlFor="catalog-search" className="sr-only">
        Search products
      </label>
      <Search
        size={20}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        id="catalog-search"
        type="search"
        name="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by product, brand or category"
        autoComplete="off"
        className="h-14 w-full rounded-md border border-border bg-canvas pl-12 pr-12 text-base text-ink shadow-[var(--shadow-sm)] transition-colors placeholder:text-muted hover:border-navy/40 focus:border-navy dark:bg-surface dark:focus:border-gold"
      />
      {pending && (
        <LoaderCircle
          size={18}
          className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-muted"
          aria-label="Searching"
          role="img"
        />
      )}
    </form>
  );
}
