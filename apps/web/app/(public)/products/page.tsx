import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PageHero } from '@/components/site/page-hero';
import { Container, Section } from '@/components/ui/container';
import { ProductsCatalog } from '@/components/products/catalog';
import { api } from '@/lib/api';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Products',
  description: 'Browse RIVET’s premium elevators, granite, doors, furniture and building materials.',
  path: '/products',
});

type SearchParams = Promise<{
  category?: string;
  search?: string;
  page?: string;
}>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1) || 1;

  const [{ products, pagination }, { categories }] = await Promise.all([
    api.products.list({
      category: sp.category,
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
        title="Products"
        description="A curated portfolio of imported elevators, natural stone, doors, furniture and fine building materials."
      />
      <Section>
        <Container>
          <Suspense fallback={<p className="text-muted">Loading catalog…</p>}>
            <ProductsCatalog
              products={products}
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
