'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, useTransition, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import type { Category, Product, Pagination } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  DepartmentGrid,
  ProductCard,
  buildCategoryTree,
} from '@/components/products/category-group';

/**
 * - `overview`: departments + featured products (the default /products page)
 * - `all`: every product, paginated (/products?view=all)
 * - `search`: search results
 */
export type CatalogMode = 'overview' | 'all' | 'search';

function productsHref({ search, page, view }: { search?: string; page?: number; view?: 'all' }) {
  const sp = new URLSearchParams();
  if (view) sp.set('view', view);
  if (search) sp.set('search', search);
  if (page && page > 1) sp.set('page', String(page));
  const qs = sp.toString();
  return qs ? `/products?${qs}` : '/products';
}

export function ProductsCatalog({
  mode,
  products,
  categories,
  pagination,
  search,
  productsHeading = 'Featured products',
}: {
  mode: CatalogMode;
  products: Product[];
  categories: Category[];
  pagination: Pagination;
  search?: string;
  /** Overview only: "Featured products", or "Latest products" when nothing is featured. */
  productsHeading?: string;
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
      const next = new URLSearchParams(params.toString());
      Object.entries(patch).forEach(([k, v]) => {
        if (!v) next.delete(k);
        else next.set(k, v);
      });
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

  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
  const departments = useMemo(() => categories.filter((c) => !c.parentId), [categories]);
  const view = mode === 'all' ? 'all' : undefined;

  return (
    <div className={cn('transition-opacity', pending && 'opacity-60')}>
      {/* Search */}
      <div className="mb-12 flex flex-col gap-4 md:mb-14 lg:flex-row lg:items-center lg:justify-between">
        {mode === 'overview' ? (
          <p className="text-[0.9375rem] text-muted">
            Browse by department, or search the full catalog by product name, brand or category.
          </p>
        ) : (
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 py-1.5 text-[0.875rem] font-semibold text-navy underline-offset-4 hover:underline"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Browse by department
          </Link>
        )}

        <form
          role="search"
          className="relative w-full lg:max-w-sm"
          onSubmit={(e) => {
            e.preventDefault();
            update({ search: searchValue.trim() || undefined });
          }}
        >
          <label htmlFor="catalog-search" className="sr-only">
            Search products
          </label>
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id="catalog-search"
            type="search"
            name="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by name, brand, category…"
            className="h-12 w-full rounded-[6px] border border-border bg-canvas pl-11 pr-4 text-[0.9375rem] text-ink placeholder:text-muted outline-none transition-colors hover:border-navy/40 focus:border-navy focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:bg-surface dark:focus:border-gold"
          />
        </form>
      </div>

      {mode === 'search' && (
        <SearchResults
          search={search ?? ''}
          products={products}
          total={pagination.total}
          departments={departments}
          onClear={() => {
            setSearchValue('');
            update({ search: undefined });
          }}
        />
      )}

      {mode === 'overview' && (
        <>
          <DepartmentGrid tree={categoryTree} />

          {products.length > 0 && (
            <section aria-labelledby="featured-heading">
              <SectionHeader
                id="featured-heading"
                eyebrow="Catalog"
                title={productsHeading}
                action={
                  <Link
                    href="/products?view=all"
                    className="inline-flex items-center gap-1.5 py-1.5 text-[0.875rem] font-semibold text-navy underline-offset-4 hover:underline"
                  >
                    View all products
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                }
              />
              <ProductGrid products={fullRows(products)} />
            </section>
          )}
        </>
      )}

      {mode === 'all' && (
        <section aria-labelledby="all-products-heading">
          <SectionHeader
            id="all-products-heading"
            eyebrow="Catalog"
            title="All products"
            action={
              <span className="text-[0.875rem] text-muted">
                {pagination.total} product{pagination.total === 1 ? '' : 's'}
              </span>
            }
          />
          {products.length === 0 ? (
            <p className="py-16 text-center text-muted">No products have been published yet.</p>
          ) : (
            <ProductGrid products={products} />
          )}
        </section>
      )}

      {mode !== 'overview' && pagination.pages > 1 && (
        <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-3">
          <PagerLink
            href={productsHref({ search, view, page: pagination.page - 1 })}
            disabled={pagination.page <= 1}
            label="Previous"
          />
          <span className="px-2 text-[0.875rem] text-muted" aria-current="page">
            Page {pagination.page} of {pagination.pages}
          </span>
          <PagerLink
            href={productsHref({ search, view, page: pagination.page + 1 })}
            disabled={pagination.page >= pagination.pages}
            label="Next"
          />
        </nav>
      )}
    </div>
  );
}

function SectionHeader({
  id,
  eyebrow,
  title,
  action,
}: {
  id: string;
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-border pb-5">
      <div>
        <span className="eyebrow text-navy-400 dark:text-gold">
          {eyebrow}
        </span>
        <h2 id={id} className="headline-display mt-2 text-[1.75rem] sm:text-[2rem]">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

/** The overview is a short teaser: trim it to complete rows of three (at least one row). */
function fullRows<T>(items: T[]): T[] {
  if (items.length <= 3) return items;
  return items.slice(0, items.length - (items.length % 3));
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

function SearchResults({
  search,
  products,
  total,
  departments,
  onClear,
}: {
  search: string;
  products: Product[];
  total: number;
  departments: Category[];
  onClear: () => void;
}) {
  if (products.length > 0) {
    return (
      <section aria-labelledby="search-heading">
        <SectionHeader
          id="search-heading"
          eyebrow="Search"
          title={`Results for “${search}”`}
          action={
            <span className="text-[0.875rem] text-muted">
              {total} result{total === 1 ? '' : 's'}
            </span>
          }
        />
        <ProductGrid products={products} />
      </section>
    );
  }

  return (
    <div className="py-16 text-center">
      <p className="text-[1.125rem] text-ink">No products found for &ldquo;{search}&rdquo;.</p>
      <p className="mt-2 text-[0.9375rem] text-muted">
        Check the spelling, try a shorter keyword, or browse a department.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {departments.map((c) => (
          <Link
            key={c.slug}
            href={`/products/${c.slug}`}
            className="rounded-[6px] border px-4 py-2 text-[0.875rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 border-border bg-canvas text-ink hover:border-navy hover:text-navy dark:bg-transparent dark:hover:border-gold dark:hover:text-gold"
          >
            {c.name}
          </Link>
        ))}
      </div>
      <button
        type="button"
        onClick={onClear}
        className="mt-8 text-[0.9375rem] font-semibold text-navy underline underline-offset-4 hover:no-underline"
      >
        Clear search
      </button>
    </div>
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
    'inline-flex h-10 items-center rounded-[6px] border border-border bg-canvas px-4 text-[0.875rem] font-medium text-ink transition-colors hover:border-navy hover:text-navy dark:bg-transparent dark:hover:border-gold dark:hover:text-gold';
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
