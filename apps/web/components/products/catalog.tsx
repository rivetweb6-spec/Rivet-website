'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, PackageOpen, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { StateMessage } from '@/components/ui/state-message';
import { RequestQuotationButton } from '@/components/quotation/request-quotation-button';
import type { Category, Product, Pagination } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  DepartmentGrid,
  ProductGrid,
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

  const clearSearch = useCallback(() => {
    const next = new URLSearchParams(params.toString());
    next.delete('search');
    next.delete('page');
    const qs = next.toString();
    router.push(qs ? `/products?${qs}` : '/products');
  }, [params, router]);

  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
  const departments = useMemo(() => categories.filter((c) => !c.parentId), [categories]);
  const view = mode === 'all' ? 'all' : undefined;

  return (
    <div>
      {/* The search box now lives in the page header (CatalogSearch). */}
      {mode !== 'overview' && (
        <Link
          href="/products"
          className="mb-8 inline-flex items-center gap-1.5 py-1.5 text-xs font-semibold text-navy underline-offset-4 hover:underline md:mb-10"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Browse by department
        </Link>
      )}

      {mode === 'search' && (
        <SearchResults
          search={search ?? ''}
          products={products}
          total={pagination.total}
          departments={departments}
          onClear={clearSearch}
        />
      )}

      {mode === 'overview' && (
        <>
          <DepartmentGrid tree={categoryTree} />

          {products.length > 0 && (
            <section aria-labelledby="featured-heading">
              <SectionHeader
                id="featured-heading"
                title={productsHeading}
                action={
                  <Link
                    href="/products?view=all"
                    className="inline-flex items-center gap-1.5 py-1.5 text-xs font-semibold text-navy underline-offset-4 hover:underline"
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
            title="All products"
            action={
              <span className="text-xs text-muted">
                {pagination.total} product{pagination.total === 1 ? '' : 's'}
              </span>
            }
          />
          {products.length === 0 ? (
            <StateMessage
              icon={PackageOpen}
              title="No products are listed yet"
              actions={
                <>
                  <RequestQuotationButton size="md" />
                  <Link href="/contact" className={buttonVariants({ variant: 'outline', size: 'md' })}>
                    Contact our team
                  </Link>
                </>
              }
            >
              The online catalog is still being filled. We supply elevators, escalators and building
              materials to order, so send us your requirements for a quotation.
            </StateMessage>
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
          <span className="px-2 text-xs text-muted" aria-current="page">
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
  title,
  action,
}: {
  id: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-border pb-5">
      <h2 id={id} className="headline-display text-3xl sm:text-4xl">
        {title}
      </h2>
      {action}
    </div>
  );
}

/** The overview is a short teaser: trim it to complete rows of three (at least one row). */
function fullRows<T>(items: T[]): T[] {
  if (items.length <= 3) return items;
  return items.slice(0, items.length - (items.length % 3));
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
  // Announce the outcome of each search to screen readers (results swap in
  // without a page load).
  const announcement =
    products.length > 0
      ? `${total} result${total === 1 ? '' : 's'} for ${search}`
      : `No products found for ${search}`;

  if (products.length > 0) {
    return (
      <section aria-labelledby="search-heading">
        <p className="sr-only" role="status">
          {announcement}
        </p>
        <SectionHeader
          id="search-heading"
          title={`Results for “${search}”`}
          action={
            <span className="text-xs text-muted">
              {total} result{total === 1 ? '' : 's'}
            </span>
          }
        />
        <ProductGrid products={products} />
      </section>
    );
  }

  return (
    <>
      <p className="sr-only" role="status">
        {announcement}
      </p>
      <StateMessage
        icon={SearchX}
        title={<>No products match &ldquo;{search}&rdquo;</>}
        actions={
          <>
            <Button variant="outline" size="md" onClick={onClear}>
              Clear search
            </Button>
            <RequestQuotationButton size="md" label="Ask us to source it" message={`Looking for: ${search}`} />
          </>
        }
      >
        <p>
          Check the spelling or try a shorter word, such as a brand or product type. You can also
          browse a department:
        </p>
        {departments.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Departments">
            {departments.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/products/${c.slug}`}
                  className="inline-flex rounded-md border border-border bg-canvas px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-navy hover:text-navy dark:bg-transparent dark:hover:border-gold dark:hover:text-gold"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </StateMessage>
    </>
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
    'inline-flex h-10 items-center rounded-md border border-border bg-canvas px-4 text-xs font-medium text-ink transition-colors hover:border-navy hover:text-navy dark:bg-transparent dark:hover:border-gold dark:hover:text-gold';
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
