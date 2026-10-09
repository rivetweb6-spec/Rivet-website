import { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageHero } from '@/components/site/page-hero';
import { Container, Section } from '@/components/ui/container';
import { ProductsCatalog } from '@/components/products/catalog';
import { api } from '@/lib/api';
import { pageMetadata } from '@/lib/seo';
import { metadataForStaticPage } from '@/lib/page-seo';

/** CMS-backed; skip static prerender so `next build` does not require a live API. */
export const dynamic = 'force-dynamic';

type SearchParams = Promise<{
  search?: string;
  category?: string;
  page?: string;
}>;

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
      description: `Products matching “${sp.search}” at RIVET — premium construction and architectural products in Ethiopia.`,
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
      description: `Browse premium ${catName.toLowerCase()} and architectural products from RIVET in Ethiopia.`,
      path: `/products/${encodeURIComponent(sp.category)}`,
    });
  }

  if (page > 1) {
    return pageMetadata({
      title: `Products — Page ${page}`,
      description: `Browse page ${page} of RIVET’s premium elevators, granite, doors, furniture and fine building materials in Ethiopia.`,
      path: `/products?page=${page}`,
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

  const [{ products, pagination }, { categories }, allProductsRes] = await Promise.all([
    api.products.list({
      search: sp.search,
      category: sp.category,
      page,
      pageSize: 12,
    }),
    api.categories.list(),
    !sp.search
      ? api.products.list({ pageSize: 100, page: 1 })
      : Promise.resolve({ products: [], pagination: { total: 0, page: 1, pageSize: 100, pages: 1 } }),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Catalog"
        title="Elevators, granite, doors & materials"
        description="A curated portfolio of imported elevators, natural stone, doors, furniture and fine building materials for projects in Ethiopia."
      />
      <Section>
        <Container>
          <Suspense fallback={<p className="text-muted">Loading catalog…</p>}>
            <ProductsCatalog
              products={products}
              allProducts={allProductsRes.products}
              categories={categories}
              pagination={pagination}
              activeCategory={sp.category}
              search={sp.search}
            />
          </Suspense>
        </Container>
      </Section>
    </>
  );
}
