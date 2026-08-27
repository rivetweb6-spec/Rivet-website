import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PageHero } from '@/components/site/page-hero';
import { Container, Section } from '@/components/ui/container';
import { ProductsCatalog } from '@/components/products/catalog';
import { api } from '@/lib/api';
import { pageMetadata } from '@/lib/seo';
import { metadataForStaticPage } from '@/lib/page-seo';

type SearchParams = Promise<{
  search?: string;
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

  if (page > 1) {
    return pageMetadata({
      title: `Products — Page ${page}`,
      description: `Browse page ${page} of RIVET’s premium elevators, granite, doors, furniture and building materials in Ethiopia.`,
      path: `/products?page=${page}`,
    });
  }

  return metadataForStaticPage('products');
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1) || 1;

  const [{ products, pagination }, { categories }] = await Promise.all([
    api.products.list({
      search: sp.search,
      page,
      pageSize: 12,
    }),
    api.categories.list(),
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
              categories={categories}
              pagination={pagination}
              search={sp.search}
            />
          </Suspense>
        </Container>
      </Section>
    </>
  );
}
