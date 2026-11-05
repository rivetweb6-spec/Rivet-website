import { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageHero } from '@/components/site/page-hero';
import { Container, Section } from '@/components/ui/container';
import { ProductsCatalog, type CatalogMode } from '@/components/products/catalog';
import { api } from '@/lib/api';
import { pageMetadata } from '@/lib/seo';
import { metadataForStaticPage } from '@/lib/page-seo';

/** CMS-backed; skip static prerender so `next build` does not require a live API. */
export const dynamic = 'force-dynamic';

type SearchParams = Promise<{
  search?: string;
  category?: string;
  page?: string;
  view?: string;
}>;

const FEATURED_LIMIT = 6;

/**
 * `/products` → departments + featured products.
 * `/products?view=all` → every product, paginated. Older `?page=N` links
 * (from before the overview existed) also land on the full list.
 */
function catalogMode(sp: Awaited<SearchParams>): CatalogMode {
  if (sp.search?.trim()) return 'search';
  const page = Number(sp.page ?? 1) || 1;
  if (sp.view === 'all' || page > 1) return 'all';
  return 'overview';
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1) || 1;

  if (sp.search) {
    return pageMetadata({
      title: `Search results for “${sp.search}”`,
      description: `Products matching “${sp.search}” at RIVET COMPANY — elevators, escalators and building materials in Ethiopia.`,
      path: '/products',
      noIndex: true,
    });
  }

  if (sp.category) {
    const { categories } = await api.categories.list();
    const cat = categories.find((c) => c.slug === sp.category);
    const catName = cat?.name ?? sp.category;
    return pageMetadata({
      title: `${catName} — Products`,
      description: `Browse ${catName.toLowerCase()} from RIVET COMPANY, supplier of elevators and building materials in Ethiopia.`,
      path: `/products/${encodeURIComponent(sp.category)}`,
    });
  }

  if (catalogMode(sp) === 'all') {
    return pageMetadata({
      title: page > 1 ? `All products — Page ${page}` : 'All products',
      description: `Browse ${page > 1 ? `page ${page} of ` : ''}the full RIVET COMPANY catalog: elevators, escalators, granite, doors, furniture, sanitary goods and building materials in Ethiopia.`,
      path: page > 1 ? `/products?view=all&page=${page}` : '/products?view=all',
    });
  }

  return metadataForStaticPage('products');
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  // When visiting /products?category=xyz without search, redirect to the canonical category route /products/xyz
  if (sp.category && !sp.search) {
    redirect(`/products/${sp.category}`);
  }

  const page = Number(sp.page ?? 1) || 1;
  const mode = catalogMode(sp);

  const [productsRes, { categories }] = await Promise.all([
    mode === 'overview'
      ? api.products.list({ featured: true, pageSize: FEATURED_LIMIT })
      : api.products.list({ search: sp.search, page, pageSize: 12 }),
    api.categories.list(),
  ]);

  // Nothing marked as featured yet → show the newest products instead.
  let { products, pagination } = productsRes;
  let productsHeading = 'Featured products';
  if (mode === 'overview' && products.length === 0) {
    ({ products, pagination } = await api.products.list({ pageSize: FEATURED_LIMIT }));
    productsHeading = 'Latest products';
  }

  return (
    <>
      <PageHero
        eyebrow="Products"
        title="Elevators, escalators & building materials"
        description="Browse elevators, passenger lifts, escalators, granite, doors, office furniture, sanitary goods and building materials supplied by RIVET COMPANY in Ethiopia."
      />
      <Section className="pt-14 md:pt-20">
        <Container>
          <Suspense fallback={<p className="text-muted">Loading catalog…</p>}>
            <ProductsCatalog
              mode={mode}
              products={products}
              categories={categories}
              pagination={pagination}
              search={sp.search}
              productsHeading={productsHeading}
            />
          </Suspense>
        </Container>
      </Section>
    </>
  );
}
