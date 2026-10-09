'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { Search } from 'lucide-react';
import type { Category, Product, Pagination } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  AllCategoriesHierarchy,
  ProductCard,
  buildCategoryTree,
} from '@/components/products/category-group';

function productsHref({
  search,
  category,
  page,
}: {
  search?: string;
  category?: string;
  page?: number;
}) {
  const sp = new URLSearchParams();
  if (category) sp.set('category', category);
  if (search) sp.set('search', search);
  if (page && page > 1) sp.set('page', String(page));
  const qs = sp.toString();
  return qs ? `/products?${qs}` : '/products';
}

export function ProductsCatalog({
  products,
  allProducts = [],
  categories,
  pagination,
  activeCategory,
  search,
}: {
  products: Product[];
  allProducts?: Product[];
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

  // Build full hierarchy tree for all categories
  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
  const primaryCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories],
  );
  const filterCategories = primaryCategories.length > 0 ? primaryCategories : categories;

  const isAllView = !search && !activeCategory;

  return (
    <div className={cn('transition-opacity', pending && 'opacity-60')}>
      {/* Category filter chips & search input */}
      <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={!activeCategory && !search}
            href="/products"
            label="All"
          />
          {filterCategories.map((c) => (
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

      {/* If search query is active: show search results */}
      {search ? (
        products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[1.125rem] text-ink">
              No products found for &ldquo;{search}&rdquo;.
            </p>
            <p className="mt-2 text-[0.9375rem] text-muted">
              Check the spelling, try a shorter keyword, or explore a category below.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <FilterChip active={false} href="/products" label="All" />
              {filterCategories.map((c) => (
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
                update({ search: undefined, category: undefined });
              }}
              className="mt-8 text-[0.875rem] font-medium text-gold hover:underline"
            >
              View all products
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="headline-display text-[1.75rem]">
                Search results for &ldquo;{search}&rdquo;
              </h2>
              <span className="text-[0.875rem] text-muted">
                {pagination.total} result{pagination.total === 1 ? '' : 's'}
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )
      ) : (
        /* When viewing "All" on /products: display the category hierarchy */
        <>
          {isAllView && (
            <AllCategoriesHierarchy
              tree={categoryTree}
              allProducts={allProducts.length > 0 ? allProducts : products}
            />
          )}

          {/* Complete Product Catalog Section */}
          <div className="pt-4">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-border/50 pb-5">
              <div>
                <span className="eyebrow text-gold-muted text-[0.6875rem] uppercase tracking-wider font-medium">
                  Catalog
                </span>
                <h3 className="headline-display mt-1 text-[1.75rem] sm:text-[2rem]">
                  {isAllView ? 'All Products' : `${activeCategory} Products`}
                </h3>
              </div>
              <span className="text-[0.875rem] text-muted">
                {pagination.total} product{pagination.total === 1 ? '' : 's'} in catalog
              </span>
            </div>

            {products.length === 0 ? (
              <div className="py-16 text-center text-muted">
                <p>No products available in this section.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="mt-14 flex items-center justify-center gap-3">
          <PagerLink
            href={productsHref({ search, category: activeCategory, page: pagination.page - 1 })}
            disabled={pagination.page <= 1}
            label="Previous"
          />
          <span className="text-[0.875rem] text-muted">
            Page {pagination.page} of {pagination.pages}
          </span>
          <PagerLink
            href={productsHref({ search, category: activeCategory, page: pagination.page + 1 })}
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
