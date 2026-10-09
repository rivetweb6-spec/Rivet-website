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

/** Collect all category IDs in a subtree (the node itself + all descendants) */
export function getCategorySubtreeIds(node: CategoryTreeNode): Set<string> {
  const ids = new Set<string>([node.id]);
  const queue = [...node.children];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    ids.add(curr.id);
    if (curr.children?.length) {
      queue.push(...curr.children);
    }
  }
  return ids;
}

/** Single reusable category card for all subcategories across the website */
export function CategoryCard({
  category,
  parentName,
  fallbackImage,
}: {
  category: CategoryItemData;
  parentName?: string;
  fallbackImage?: string;
}) {
  const image = category.image || fallbackImage || assets.categories.elevators;

  return (
    <div className="luxury-card group flex h-full flex-col overflow-hidden rounded-[16px] bg-canvas shadow-[var(--shadow-sm)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]">
      {/* Clickable Image */}
      <Link
        href={`/products/${category.slug}`}
        className="relative aspect-[4/3] overflow-hidden block"
        aria-label={`View ${category.name}`}
      >
        <RivetImage
          src={image}
          alt={`${category.name} — premium solutions by Rivet`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent"
          aria-hidden="true"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        {parentName && (
          <span className="eyebrow text-gold-muted text-[0.6875rem] uppercase tracking-wider font-medium">
            {parentName}
          </span>
        )}
        <h4 className="headline-display mt-2 text-[1.25rem]">
          <Link
            href={`/products/${category.slug}`}
            className="transition-colors hover:text-gold"
          >
            {category.name}
          </Link>
        </h4>
        <p className="mt-2 flex-1 text-[0.875rem] leading-relaxed text-muted line-clamp-3">
          {category.description ||
            `Explore premium ${category.name.toLowerCase()} supplied and installed by Rivet for projects in Ethiopia.`}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40">
          <Link
            href={`/products/${category.slug}`}
            className="inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-navy transition-colors hover:text-gold"
          >
            View category
            <ArrowRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/request-quotation"
            className="inline-flex items-center gap-1 text-[0.8125rem] font-medium text-gold transition-colors hover:text-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            Request quotation
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Reusable category group displaying a header and grid of CategoryCard items */
export function CategoryGroup({
  name,
  slug,
  children,
  fallbackImage,
  showGroupHeader = true,
}: {
  name: string;
  slug?: string;
  children: CategoryItemData[];
  fallbackImage?: string;
  showGroupHeader?: boolean;
}) {
  if (!children.length) return null;

  return (
    <div>
      {showGroupHeader && (
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-8">
          <h3 className="text-[1.5rem] sm:text-[1.75rem] font-medium text-navy">
            {slug ? (
              <Link href={`/products/${slug}`} className="transition-colors hover:text-gold">
                {name}
              </Link>
            ) : (
              name
            )}
          </h3>
          {slug && (
            <Link
              href={`/products/${slug}`}
              className="inline-flex items-center gap-1 text-[0.875rem] font-medium text-gold hover:text-gold-soft transition-colors"
            >
              View all {name.toLowerCase()}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
        </div>
      )}

      <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {children.map((child) => (
          <StaggerItem key={child.id || child.slug}>
            <CategoryCard
              category={child}
              parentName={name}
              fallbackImage={fallbackImage}
            />
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
                  children={group.children ?? []}
                  fallbackImage={group.image || category.image || undefined}
                  showGroupHeader={true}
                />
              ))}
              {directChildren.length > 0 && (
                <CategoryGroup
                  name={`${category.name} Solutions`}
                  slug={category.slug}
                  children={directChildren}
                  fallbackImage={category.image || undefined}
                  showGroupHeader={true}
                />
              )}
            </>
          ) : (
            <CategoryGroup
              name={category.name}
              slug={category.slug}
              children={category.children}
              fallbackImage={category.image || undefined}
              showGroupHeader={false}
            />
          )}
        </div>
      </Container>
    </Section>
  );
}

/** Complete category hierarchy rendered on /products when "All" is active */
export function AllCategoriesHierarchy({
  tree,
  allProducts = [],
}: {
  tree: CategoryTreeNode[];
  allProducts: Product[];
}) {
  if (!tree.length) return null;

  return (
    <div className="space-y-24 mb-24">
      {tree.map((root) => {
        const subtreeIds = getCategorySubtreeIds(root);
        const branchProducts = allProducts.filter((p) => subtreeIds.has(p.categoryId));

        const rootChildren = root.children ?? [];
        const subGroups = rootChildren.filter((c) => Array.isArray(c.children) && c.children.length > 0);
        const directChildren = rootChildren.filter((c) => !Array.isArray(c.children) || c.children.length === 0);

        return (
          <section key={root.id} id={root.slug} className="scroll-mt-28">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 mb-6">
              <div>
                <span className="eyebrow text-gold-muted text-[0.6875rem] uppercase tracking-wider font-medium">
                  Department
                </span>
                <h2 className="headline-display mt-1 text-[2rem] sm:text-[2.5rem]">
                  <Link href={`/products/${root.slug}`} className="transition-colors hover:text-gold">
                    {root.name}
                  </Link>
                </h2>
              </div>
              <Link
                href={`/products/${root.slug}`}
                className="inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-gold hover:text-gold-soft transition-colors"
              >
                Explore all {root.name.toLowerCase()}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            {root.description && (
              <p className="max-w-3xl text-[1rem] leading-relaxed text-muted mb-8">
                {root.description}
              </p>
            )}

            {/* Subcategories hierarchy */}
            {rootChildren.length > 0 && (
              <div className="space-y-14 mb-12">
                {subGroups.length > 0 ? (
                  <>
                    {subGroups.map((group) => (
                      <CategoryGroup
                        key={group.id}
                        name={group.name}
                        slug={group.slug}
                        children={group.children ?? []}
                        fallbackImage={group.image || root.image || undefined}
                        showGroupHeader={true}
                      />
                    ))}
                    {directChildren.length > 0 && (
                      <CategoryGroup
                        name={`${root.name} Solutions`}
                        slug={root.slug}
                        children={directChildren}
                        fallbackImage={root.image || undefined}
                        showGroupHeader={true}
                      />
                    )}
                  </>
                ) : (
                  <CategoryGroup
                    name={root.name}
                    slug={root.slug}
                    children={rootChildren}
                    fallbackImage={root.image || undefined}
                    showGroupHeader={false}
                  />
                )}
              </div>
            )}

            {/* Relevant Products in this category branch */}
            {branchProducts.length > 0 && (
              <div className="mt-10 rounded-[20px] bg-surface/60 border border-border/50 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-6">
                  <div>
                    <h3 className="headline-display text-[1.25rem] sm:text-[1.5rem]">
                      {root.name} Products
                    </h3>
                    <p className="text-[0.875rem] text-muted mt-1">
                      Certified models and architectural equipment available in Ethiopia.
                    </p>
                  </div>
                  <Link
                    href={`/products/${root.slug}`}
                    className="text-[0.875rem] font-medium text-gold hover:text-gold-soft transition-colors"
                  >
                    View all in {root.name.toLowerCase()} ({branchProducts.length}) &rarr;
                  </Link>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {branchProducts.slice(0, 6).map((p) => (
                    <ProductCard key={p.id} product={p} categoryName={root.name} />
                  ))}
                </div>
              </div>
            )}

            <div className="gold-rule mt-16" aria-hidden="true" />
          </section>
        );
      })}
    </div>
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
    </div>
  );
}
