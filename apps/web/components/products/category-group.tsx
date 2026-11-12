'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';
import { Container, Section } from '@/components/ui/container';
import { RivetImage } from '@/components/ui/rivet-image';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { StateMessage } from '@/components/ui/state-message';
import { RequestQuotationButton } from '@/components/quotation/request-quotation-button';
import { buildProductAltText } from '@/lib/seo';
import type { Category, Product } from '@/lib/api';
import { buttonVariants } from '@/components/ui/button-variants';
import { countSubtreeProducts, type CategoryTreeNode } from '@/lib/category-tree';
import { ProductTile } from '@/components/products/product-tile';
import { cn } from '@/lib/utils';

export type CategoryItemData = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  _count?: { products: number; children?: number };
};

// Tree helpers live in lib/ so Server Components can use them too.
export { buildCategoryTree, countSubtreeProducts, type CategoryTreeNode } from '@/lib/category-tree';

/**
 * One availability vocabulary everywhere: "N products" when some are listed
 * online, "Supplied on request" when none are (RIVET still sources them).
 * Unknown counts show nothing rather than a vague "View range".
 */
export function productCountLabel(count: number | undefined): string | null {
  if (count === undefined) return null;
  if (count === 0) return 'Supplied on request';
  return `${count} product${count === 1 ? '' : 's'}`;
}

export function rangeCountLabel(count: number): string {
  return `${count} range${count === 1 ? '' : 's'}`;
}

/** Category (range) card. Categories use 3:2 photos; products use 4:3. */
export function CategoryCard({
  category,
  fallbackImage,
  headingLevel: Heading = 'h3',
}: {
  category: CategoryItemData;
  fallbackImage?: string;
  /** Pick the level that follows the surrounding heading outline. */
  headingLevel?: 'h3' | 'h4';
}) {
  // The parent's photo is an acceptable stand-in; an unrelated stock photo is not.
  const image = category.image || fallbackImage;
  const count = productCountLabel(category._count?.products);

  return (
    <Link
      href={`/products/${category.slug}`}
      className="card-frame group flex h-full flex-col overflow-hidden rounded-lg bg-canvas"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-bg">
        {image ? (
          <RivetImage
            src={image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <Heading className="text-xl leading-snug group-hover:underline group-hover:underline-offset-4 group-focus-visible:underline group-focus-visible:underline-offset-4">
          {category.name}
        </Heading>
        <p className="mt-2 flex-1 text-xs leading-relaxed text-muted line-clamp-2">
          {category.description || `Supplied by RIVET COMPANY for projects in Ethiopia.`}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3.5 text-xs">
          <span className="text-muted">{count}</span>
          <ArrowRight size={16} className="shrink-0 text-navy dark:text-gold" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}

/** Reusable category group displaying a header and grid of CategoryCard items */
export function CategoryGroup({
  name,
  slug,
  items,
  fallbackImage,
  showGroupHeader = true,
}: {
  name: string;
  slug?: string;
  items: CategoryItemData[];
  fallbackImage?: string;
  showGroupHeader?: boolean;
}) {
  if (!items.length) return null;

  return (
    <div>
      {showGroupHeader && (
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-border pb-4">
          <div>
            <h3 className="headline-display text-2xl sm:text-3xl">{name}</h3>
            <p className="mt-1 text-2xs text-muted">{rangeCountLabel(items.length)}</p>
          </div>
          {slug && (
            <Link
              href={`/products/${slug}`}
              className="inline-flex items-center gap-1.5 py-1.5 text-xs font-semibold text-navy underline-offset-4 hover:underline"
            >
              View all<span className="sr-only"> {name}</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
        </div>
      )}

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {items.map((child) => (
          <li key={child.id || child.slug}>
            <CategoryCard
              category={child}
              fallbackImage={fallbackImage}
              // Under a group heading (h3) cards are h4; otherwise they follow the section h2.
              headingLevel={showGroupHeader ? 'h4' : 'h3'}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Product card for API products — a thin adapter over the shared ProductTile. */
export function ProductCard({
  product,
  categoryName,
  showCategory = true,
  layout,
}: {
  product: Product;
  categoryName?: string;
  /** Hide the category label when every card on the page shares it. */
  showCategory?: boolean;
  layout?: 'card' | 'wide';
}) {
  const cat = categoryName || product.category?.name || 'Product';
  return (
    <ProductTile
      href={`/products/${product.slug}`}
      name={product.name}
      description={product.shortDescription}
      image={product.images?.[0]?.url}
      imageAlt={
        product.images?.[0]?.alt || buildProductAltText(product.name, cat, product.shortDescription)
      }
      category={showCategory ? cat : null}
      layout={layout}
    />
  );
}

/**
 * Grid of product cards that adapts to small counts: one product gets a wide
 * card instead of sitting alone in a third of the row; two share the row.
 */
export function ProductGrid({
  products,
  categoryName,
  showCategory = true,
}: {
  products: Product[];
  categoryName?: string;
  showCategory?: boolean;
}) {
  if (products.length === 1) {
    return (
      <div className="max-w-4xl">
        <ProductCard
          product={products[0]!}
          categoryName={categoryName}
          showCategory={showCategory}
          layout="wide"
        />
      </div>
    );
  }
  return (
    <ul
      className={cn(
        'grid gap-5 sm:grid-cols-2 lg:gap-6',
        products.length === 2 ? 'lg:max-w-5xl' : 'md:grid-cols-3',
      )}
    >
      {products.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} categoryName={categoryName} showCategory={showCategory} />
        </li>
      ))}
    </ul>
  );
}

/** Dynamic hierarchy section for parent and mid-level category pages */
export function CategoryHierarchySection({
  category,
  eyebrow,
  title,
  description,
}: {
  category: Category;
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  if (!category.children?.length) return null;

  // Multi-level: check if any children have their own children (sub-groups like Passenger, Commercial, Service & Freight)
  const subGroups = category.children.filter(
    (c) => Array.isArray(c.children) && c.children.length > 0,
  );
  const directChildren = category.children.filter(
    (c) => !Array.isArray(c.children) || c.children.length === 0,
  );

  // `eyebrow` is still accepted for API compatibility but no longer shown:
  // it repeated the title ("Elevator Solutions" above "Explore our elevator range").
  void eyebrow;
  const sectionTitle =
    title ||
    (category.slug === 'elevators'
      ? 'Explore our elevator range'
      : `Explore our ${category.name.toLowerCase()} range`);
  const sectionDescription =
    description ||
    category.description ||
    `Browse the complete ${category.name.toLowerCase()} range from RIVET COMPANY.`;

  return (
    <Section className="bg-surface">
      <Container>
        <h2 className="headline-display text-4xl sm:text-6xl">{sectionTitle}</h2>
        <p className="mt-4 max-w-2xl text-md leading-relaxed text-muted">
          {sectionDescription}
        </p>

        <div className="mt-12 space-y-16">
          {subGroups.length > 0 ? (
            <>
              {subGroups.map((group) => (
                <CategoryGroup
                  key={group.id}
                  name={group.name}
                  slug={group.slug}
                  items={group.children ?? []}
                  fallbackImage={group.image || category.image || undefined}
                  showGroupHeader={true}
                />
              ))}
              {directChildren.length > 0 && (
                <CategoryGroup
                  name={`${category.name} Solutions`}
                  slug={category.slug}
                  items={directChildren}
                  fallbackImage={category.image || undefined}
                  showGroupHeader={true}
                />
              )}
            </>
          ) : (
            <CategoryGroup
              name={category.name}
              slug={category.slug}
              items={category.children}
              fallbackImage={category.image || undefined}
              showGroupHeader={false}
            />
          )}
        </div>
      </Container>
    </Section>
  );
}

/** Department overview rendered on /products when "All" is active */
export function DepartmentGrid({ tree }: { tree: CategoryTreeNode[] }) {
  if (!tree.length) return null;

  return (
    <section aria-labelledby="departments-heading" className="mb-20">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-border/60 pb-5">
        <h2 id="departments-heading" className="headline-display text-3xl sm:text-4xl">
          Browse by department
        </h2>
        <span className="text-xs text-muted">
          {tree.length} department{tree.length === 1 ? '' : 's'}
        </span>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {tree.map((root) => {
          const productCount = countSubtreeProducts(root);
          const subs = root.children;
          const shownSubs = subs.slice(0, 3);
          const hiddenSubs = subs.length - shownSubs.length;

          return (
            <li
              key={root.id}
              className="card-frame group relative flex flex-col overflow-hidden rounded-lg bg-canvas focus-ring-card"
            >
              <div className="relative aspect-[3/2] overflow-hidden bg-bg">
                {root.image ? (
                  <RivetImage
                    src={root.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <ImagePlaceholder />
                )}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-deep/50 via-transparent to-transparent"
                  aria-hidden="true"
                />
                <span className="absolute bottom-4 left-5 rounded-sm bg-white px-2.5 py-1 text-3xs font-semibold text-[#002f54]">
                  {productCountLabel(productCount)}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl leading-snug">
                  {/* Stretched link: the whole tile opens the department. */}
                  <Link
                    href={`/products/${root.slug}`}
                    className="card-link underline-offset-4 group-hover:underline group-focus-visible:underline focus-visible:underline after:absolute after:inset-0 after:content-['']"
                  >
                    {root.name}
                  </Link>
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted line-clamp-2">
                  {root.description ||
                    `${root.name} supplied by RIVET COMPANY for projects in Ethiopia.`}
                </p>

                {shownSubs.length > 0 && (
                  <ul className="relative z-10 mt-4 flex flex-wrap gap-1.5" aria-label={`${root.name} subcategories`}>
                    {shownSubs.map((sub) => (
                      <li key={sub.id}>
                        <Link
                          href={`/products/${sub.slug}`}
                          className="inline-flex rounded-sm border border-border bg-bg px-2.5 py-1 text-2xs font-medium text-ink transition-colors hover:border-navy hover:text-navy dark:hover:border-gold dark:hover:text-gold"
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                    {hiddenSubs > 0 && (
                      <li className="inline-flex items-center px-1.5 text-3xs text-muted">
                        +{hiddenSubs} more
                      </li>
                    )}
                  </ul>
                )}

                <div className="mt-auto pt-5">
                  <div className="flex items-center justify-between border-t border-border pt-3.5 text-xs">
                    <span className="text-muted">{subs.length > 0 ? rangeCountLabel(subs.length) : null}</span>
                    <ArrowRight size={16} className="shrink-0 text-navy dark:text-gold" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Clean branded empty state for categories with no published products yet */
export function ProductEmptyState({
  categoryName,
  productInterest,
}: {
  categoryName: string;
  /** Prefills the quotation form's product category. */
  productInterest?: string;
}) {
  return (
    <StateMessage
      as="h3"
      icon={Package}
      title={`${categoryName} products are supplied on request`}
      actions={
        <>
          <RequestQuotationButton size="md" productInterest={productInterest} />
          <Link href="/contact" className={buttonVariants({ variant: 'outline', size: 'md' })}>
            Contact our team
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 px-1 text-sm font-semibold text-navy underline-offset-4 hover:underline"
          >
            Browse all products
          </Link>
        </>
      }
    >
      None are listed online yet, but our team sources {categoryName.toLowerCase()} for projects
      to your specification. Send your requirements for a quotation.
    </StateMessage>
  );
}
