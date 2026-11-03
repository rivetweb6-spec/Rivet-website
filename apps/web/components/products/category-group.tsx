'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { RivetImage } from '@/components/ui/rivet-image';
import { Stagger, StaggerItem } from '@/components/motion/reveal';
import { assets } from '@/lib/assets';
import { buildProductAltText } from '@/lib/seo';
import type { Category, Product } from '@/lib/api';

export type CategoryItemData = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  _count?: { products: number; children?: number };
};

export type CategoryTreeNode = Category & {
  children: CategoryTreeNode[];
};

/** Build a complete arbitrary-depth category tree from flat API list */
export function buildCategoryTree(allCategories: Category[]): CategoryTreeNode[] {
  const map = new Map<string, CategoryTreeNode>();
  for (const c of allCategories) {
    map.set(c.id, {
      ...c,
      children: [],
    });
  }

  const roots: CategoryTreeNode[] = [];
  for (const c of allCategories) {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: CategoryTreeNode[]) => {
    nodes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
    for (const node of nodes) {
      if (node.children.length > 0) {
        sortNodes(node.children);
      }
    }
  };

  sortNodes(roots);
  return roots;
}

/** Total published products in a category and all of its descendants. */
export function countSubtreeProducts(node: CategoryTreeNode): number {
  let total = node._count?.products ?? 0;
  for (const child of node.children) total += countSubtreeProducts(child);
  return total;
}

function productCountLabel(count: number | undefined): string {
  if (count === undefined) return 'View range';
  if (count === 0) return 'Available on request';
  return `${count} product${count === 1 ? '' : 's'}`;
}

const cardLinkFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg';

/** Single reusable category card for all subcategories across the website */
export function CategoryCard({
  category,
  fallbackImage,
}: {
  category: CategoryItemData;
  fallbackImage?: string;
}) {
  const image = category.image || fallbackImage || assets.categories.elevators;

  return (
    <Link
      href={`/products/${category.slug}`}
      className={`luxury-card group flex h-full flex-col overflow-hidden rounded-[16px] bg-canvas shadow-[var(--shadow-sm)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] ${cardLinkFocus}`}
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-pearl">
        <RivetImage
          src={image}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h4 className="headline-display text-[1.25rem] leading-snug transition-colors group-hover:text-gold">
          {category.name}
        </h4>
        <p className="mt-2 flex-1 text-[0.875rem] leading-relaxed text-muted line-clamp-2">
          {category.description ||
            `Supplied and installed by Rivet for projects across Ethiopia.`}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/50 pt-4 text-[0.8125rem]">
          <span className="text-muted">{productCountLabel(category._count?.products)}</span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-navy transition-colors group-hover:text-gold">
            Explore
            <ArrowRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
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
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-border/60 pb-4">
          <div>
            <h3 className="headline-display text-[1.5rem] sm:text-[1.75rem]">{name}</h3>
            <p className="mt-1 text-[0.8125rem] text-muted">
              {items.length} {items.length === 1 ? 'category' : 'categories'}
            </p>
          </div>
          {slug && (
            <Link
              href={`/products/${slug}`}
              className="inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-navy transition-colors hover:text-gold"
            >
              View all<span className="sr-only"> {name}</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
        </div>
      )}

      <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((child) => (
          <StaggerItem key={child.id || child.slug}>
            <CategoryCard category={child} fallbackImage={fallbackImage} />
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

/** Reusable product card with consistent luxury styling */
export function ProductCard({
  product,
  categoryName,
}: {
  product: Product;
  categoryName?: string;
}) {
  const image = product.images?.[0]?.url ?? assets.products.p1;
  const cat = categoryName || product.category?.name || 'Product';
  const alt =
    product.images?.[0]?.alt ||
    buildProductAltText(product.name, cat, product.shortDescription);

  return (
    <Link
      key={product.id}
      href={`/products/${product.slug}`}
      className="luxury-card group overflow-hidden rounded-[16px] bg-surface shadow-[var(--shadow-sm)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <RivetImage
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <span className="eyebrow text-gold-muted text-[0.6875rem] uppercase tracking-wider font-medium">
          {cat}
        </span>
        <h3 className="headline-display mt-2 text-[1.1875rem]">{product.name}</h3>
        {product.shortDescription && (
          <p className="mt-2 line-clamp-2 text-[0.875rem] text-muted">
            {product.shortDescription}
          </p>
        )}
        <div className="mt-4 flex items-center text-[0.875rem] font-semibold text-gold transition-colors group-hover:text-gold-soft">
          View product
          <ArrowRight
            size={14}
            className="ml-1.5 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
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

  const sectionEyebrow = eyebrow || `${category.name} Solutions`;
  const sectionTitle =
    title ||
    (category.slug === 'elevators'
      ? 'Explore our elevator range'
      : `Explore our ${category.name.toLowerCase()} range`);
  const sectionDescription =
    description ||
    category.description ||
    `Browse the complete ${category.name.toLowerCase()} range from Rivet.`;

  return (
    <Section className="bg-surface">
      <Container>
        <Eyebrow>{sectionEyebrow}</Eyebrow>
        <h2 className="mt-3 text-[2rem] sm:text-[2.5rem]">
          {sectionTitle}
        </h2>
        <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-muted">
          {sectionDescription}
        </p>

        <div className="gold-rule mt-10" aria-hidden="true" />

        <div className="mt-14 space-y-20">
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
        <div>
          <span className="eyebrow text-gold-muted text-[0.6875rem] uppercase tracking-wider font-medium">
            Departments
          </span>
          <h2 id="departments-heading" className="headline-display mt-1 text-[1.75rem] sm:text-[2rem]">
            Browse by department
          </h2>
        </div>
        <span className="text-[0.875rem] text-muted">
          {tree.length} department{tree.length === 1 ? '' : 's'}
        </span>
      </div>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tree.map((root) => {
          const productCount = countSubtreeProducts(root);
          const subs = root.children;
          const shownSubs = subs.slice(0, 3);
          const hiddenSubs = subs.length - shownSubs.length;

          return (
            <li
              key={root.id}
              className="luxury-card group relative flex flex-col overflow-hidden rounded-[18px] bg-canvas shadow-[var(--shadow-sm)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] focus-within:ring-2 focus-within:ring-gold focus-within:ring-offset-2 focus-within:ring-offset-bg"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-pearl">
                <RivetImage
                  src={root.image || assets.categories.elevators}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/55 via-navy/0 to-transparent"
                  aria-hidden="true"
                />
                <span className="absolute bottom-4 left-5 rounded-full bg-white/95 px-3 py-1 text-[0.75rem] font-medium text-navy shadow-[var(--shadow-sm)]">
                  {productCountLabel(productCount)}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="headline-display text-[1.375rem] leading-snug">
                  {/* Stretched link: the whole tile opens the department. */}
                  <Link
                    href={`/products/${root.slug}`}
                    className="transition-colors group-hover:text-gold focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
                  >
                    {root.name}
                  </Link>
                </h3>
                <p className="mt-2 text-[0.875rem] leading-relaxed text-muted line-clamp-2">
                  {root.description ||
                    `Imported ${root.name.toLowerCase()} supplied and installed by Rivet across Ethiopia.`}
                </p>

                {shownSubs.length > 0 && (
                  <ul className="relative z-10 mt-4 flex flex-wrap gap-1.5" aria-label={`${root.name} subcategories`}>
                    {shownSubs.map((sub) => (
                      <li key={sub.id}>
                        <Link
                          href={`/products/${sub.slug}`}
                          className="inline-flex rounded-full border border-border bg-surface px-3 py-1 text-[0.75rem] font-medium text-ink transition-colors hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                    {hiddenSubs > 0 && (
                      <li className="inline-flex items-center px-1.5 text-[0.75rem] text-muted">
                        +{hiddenSubs} more
                      </li>
                    )}
                  </ul>
                )}

                <div className="mt-auto pt-5">
                  <div className="flex items-center justify-between border-t border-border/50 pt-4 text-[0.8125rem]">
                    <span className="text-muted">
                      {subs.length > 0
                        ? `${subs.length} ${subs.length === 1 ? 'category' : 'categories'}`
                        : 'Full range'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-navy transition-colors group-hover:text-gold">
                      Explore
                      <ArrowRight
                        size={15}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
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
export function ProductEmptyState({ categoryName }: { categoryName: string }) {
  return (
    <div className="rounded-[16px] border border-dashed border-border/80 bg-surface/50 p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold mb-3">
        <Package size={22} strokeWidth={1.5} />
      </div>
      <h3 className="text-[1.125rem] font-semibold text-ink">
        No published products in {categoryName} yet
      </h3>
      <p className="mt-2 text-[0.875rem] text-muted max-w-md mx-auto">
        Products are added regularly from our international manufacturing partners. Contact our team to request custom specifications or pricing.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/request-quotation"
          className="inline-flex h-11 items-center justify-center rounded-[10px] bg-gold px-6 text-[0.875rem] font-medium text-navy transition-all hover:brightness-110"
        >
          Request a quotation
        </Link>
        <Link
          href="/contact"
          className="inline-flex h-11 items-center justify-center rounded-[10px] border border-border px-6 text-[0.875rem] font-medium text-ink transition-colors hover:border-gold hover:text-gold"
        >
          Contact our team
        </Link>
      </div>
      <Link
        href="/products"
        className="mt-5 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-navy underline-offset-4 transition-colors hover:text-gold hover:underline"
      >
        Browse all products
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );
}
