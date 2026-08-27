'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { Search } from 'lucide-react';
import type { Category, Product, Pagination } from '@/lib/api';
import { RivetImage } from '@/components/ui/rivet-image';
import { assets } from '@/lib/assets';
import { buildProductAltText } from '@/lib/seo';
import { cn } from '@/lib/utils';

function productsHref({ search, page }: { search?: string; page?: number }) {
  const sp = new URLSearchParams();
  if (search) sp.set('search', search);
  if (page && page > 1) sp.set('page', String(page));
  const qs = sp.toString();
  return qs ? `/products?${qs}` : '/products';
}

export function ProductsCatalog({
  products,
  categories,
  pagination,
  activeCategory,
  search,
}: {
  products: Product[];
  categories: Category[];
  pagination: Pagination;
  activeCategory?: string;
  search?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(search ?? '');

  useEffect(() => {
    setSearchValue(search ?? '');
  }, [search]);

  const update = useCallback(
    (patch: Record<string, string | undefined>) => {
      // Category chips navigate to path-based category pages
      if (patch.category) {
        startTransition(() => {
          router.push(`/products/${patch.category}`);
        });
        return;
      }
      const next = new URLSearchParams(params.toString());
      Object.entries(patch).forEach(([k, v]) => {
        if (!v) next.delete(k);
        else next.set(k, v);
      });
      next.delete('category');
      if (!('page' in patch)) next.delete('page');
      const qs = next.toString();
      startTransition(() => {
        router.push(qs ? `/products?${qs}` : '/products');
      });
    },
    [params, router],
  );

  // Search as you type (debounced) — Enter still submits immediately.
  useEffect(() => {
    const trimmed = searchValue.trim();
    if (trimmed === (search ?? '')) return;
    const timer = window.setTimeout(() => {
      update({ search: trimmed || undefined });
    }, 450);
    return () => window.clearTimeout(timer);
  }, [searchValue, search, update]);

  return (
    <div className={cn('transition-opacity', pending && 'opacity-60')}>
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={!activeCategory} href="/products" label="All" />
          {categories.map((c) => (
            <FilterChip
              key={c.slug}
              active={activeCategory === c.slug}
              href={`/products/${c.slug}`}
              label={c.name}
            />
          ))}
        </div>

        <form
          className="relative w-full max-w-sm"
          onSubmit={(e) => {
            e.preventDefault();
            update({ search: searchValue.trim() || undefined });
          }}
        >
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            name="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by name, brand, category…"
            className="h-12 w-full rounded-[12px] border border-border bg-surface pl-11 pr-4 text-[0.9375rem] outline-none transition-colors focus:border-navy focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          />
        </form>
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-[1.125rem] text-ink">
            {search ? <>No products found for &ldquo;{search}&rdquo;.</> : 'No products match your filters.'}
          </p>
          <p className="mt-2 text-[0.9375rem] text-muted">
            Check the spelling, try a shorter keyword, or explore a category below.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <FilterChip
                key={c.slug}
                active={false}
                href={`/products/${c.slug}`}
                label={c.name}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchValue('');
              update({ search: undefined });
            }}
            className="mt-8 text-[0.875rem] font-medium text-gold hover:underline"
          >
            View all products
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Names the results region so the card headings do not jump from h1 to h3. */}
          <h2 className="sr-only">
            {search ? `Search results for ${search}` : 'Product catalog'}
          </h2>
          {products.map((p) => {
            const image = p.images[0]?.url ?? assets.products.p1;
            return (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="luxury-card group overflow-hidden rounded-[4px] border border-border/60 bg-canvas shadow-[var(--shadow-sm)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <RivetImage
                    src={image}
                    alt={
                      p.images[0]?.alt ||
                      buildProductAltText(p.name, p.category?.name, p.shortDescription)
                    }
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                  />
                </div>
                <div className="p-6">
                  <span className="eyebrow text-gold-muted">{p.category?.name ?? 'Product'}</span>
                  <h3 className="headline-display mt-2 text-[1.25rem]">{p.name}</h3>
                  {p.shortDescription && (
                    <p className="mt-2 line-clamp-2 text-[0.875rem] text-muted">{p.shortDescription}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="mt-14 flex items-center justify-center gap-3">
          <PagerLink
            href={productsHref({ search, page: pagination.page - 1 })}
            disabled={pagination.page <= 1}
            label="Previous"
          />
          <span className="text-[0.875rem] text-muted">
            Page {pagination.page} of {pagination.pages}
          </span>
          <PagerLink
            href={productsHref({ search, page: pagination.page + 1 })}
            disabled={pagination.page >= pagination.pages}
            label="Next"
          />
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  href,
}: {
  label: string;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'rounded-full border px-4 py-2 text-[0.8125rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
        active
          ? 'border-navy bg-navy text-white'
          : 'border-border bg-surface text-ink hover:border-gold hover:text-gold',
      )}
    >
      {label}
    </Link>
  );
}

function PagerLink({
  label,
  href,
  disabled,
}: {
  label: string;
  href: string;
  disabled: boolean;
}) {
  const className =
    'rounded-[12px] border border-border px-4 py-2 text-[0.875rem] transition-colors hover:border-gold hover:text-gold';
  if (disabled) {
    return (
      <span className={cn(className, 'pointer-events-none opacity-40')} aria-disabled="true">
        {label}
      </span>
    );
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}
