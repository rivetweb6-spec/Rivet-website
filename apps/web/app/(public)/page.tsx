import type { Metadata } from 'next';
import { Hero } from '@/components/home/hero';
import { Intro } from '@/components/home/intro';
import { ManagementMessages } from '@/components/home/management-messages';
import { Categories } from '@/components/home/categories';
import { Featured } from '@/components/home/featured';
import { Services } from '@/components/home/services';
import { WhyChoose } from '@/components/home/why-choose';
import { Stats } from '@/components/home/stats';
import { News } from '@/components/home/news';
import { QuotationCta } from '@/components/home/quotation-cta';
import { metadataForStaticPage } from '@/lib/page-seo';
import { api } from '@/lib/api';
import { assets } from '@/lib/assets';
import { sortNewsNewestFirst } from '@/lib/news';

export async function generateMetadata(): Promise<Metadata> {
  return metadataForStaticPage('home');
}

export default async function HomePage() {
  const [homeResult, newsResult, categoriesResult, featuredResult, servicesResult] =
    await Promise.allSettled([
      api.home(),
      api.news.list({ pageSize: 3 }),
      api.categories.list(),
      api.products.list({ featured: true, pageSize: 6 }),
      api.services.list(),
    ]);

  const home = homeResult.status === 'fulfilled' ? homeResult.value.home : null;
  const articles =
    newsResult.status === 'fulfilled'
      ? sortNewsNewestFirst(newsResult.value.articles).slice(0, 3)
      : [];
  // Pass `undefined` only when the API call failed (allows local demo fallbacks).
  // Pass `[]` when the API succeeded but returned no rows — never invent catalog links.
  const categories =
    categoriesResult.status === 'fulfilled'
      ? categoriesResult.value.categories.map((c) => ({
          slug: c.slug,
          name: c.name,
          image: c.image,
        }))
      : undefined;

  let featured:
    | {
        slug: string;
        name: string;
        category: string;
        description: string;
        image: string;
      }[]
    | undefined =
    featuredResult.status === 'fulfilled'
      ? featuredResult.value.products.map((p) => ({
          slug: p.slug,
          name: p.name,
          category: p.category?.name ?? 'Product',
          description: p.shortDescription ?? '',
          image: p.images[0]?.url ?? assets.products.p1,
        }))
      : undefined;

  if (!featured?.length) {
    try {
      const { products } = await api.products.list({ pageSize: 5 });
      featured = products.map((p) => ({
        slug: p.slug,
        name: p.name,
        category: p.category?.name ?? 'Product',
        description: p.shortDescription ?? '',
        image: p.images[0]?.url ?? assets.products.p1,
      }));
    } catch {
      /* leave undefined so Featured can use local demo fallbacks when API is down */
      if (featuredResult.status === 'fulfilled') featured = [];
    }
  }

  const services =
    servicesResult.status === 'fulfilled'
      ? servicesResult.value.services.map((s) => ({
          slug: s.slug,
          title: s.title,
          statement: s.narrative,
          icon: s.icon,
        }))
      : undefined;

  return (
    <>
      <Hero content={home} />
      <Intro content={home} />
      <ManagementMessages content={home} />
      <Categories items={categories} />
      <Featured products={featured} />
      <Services items={services} />
      <WhyChoose />
      <Stats />
      <News articles={articles} />
      <QuotationCta />
    </>
  );
}
