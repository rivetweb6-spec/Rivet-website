import type { Metadata } from 'next';
import { Hero } from '@/components/home/hero';
import { Intro } from '@/components/home/intro';
import { Categories } from '@/components/home/categories';
import { Featured } from '@/components/home/featured';
import { Services } from '@/components/home/services';
import { WhyChoose } from '@/components/home/why-choose';
import { Stats } from '@/components/home/stats';
import { News } from '@/components/home/news';
import { QuotationCta } from '@/components/home/quotation-cta';
import { resolveSeo } from '@/lib/seo';
import { api } from '@/lib/api';
import { sortNewsNewestFirst } from '@/lib/news';

export async function generateMetadata(): Promise<Metadata> {
  let page = null;
  try {
    ({ page } = await api.pageSeo.byKey('home'));
  } catch {
    /* defaults */
  }
  return resolveSeo(page, {
    title: 'Premium Elevators, Granite & Building Materials in Ethiopia',
    description:
      'RIVET imports premium elevators, granite, doors, sanitary ware and building materials for projects in Ethiopia. Browse our catalog and request a quotation.',
    path: '/',
  });
}

export default async function HomePage() {
  const [homeResult, newsResult] = await Promise.allSettled([
    api.home(),
    api.news.list({ pageSize: 3 }),
  ]);

  const home = homeResult.status === 'fulfilled' ? homeResult.value.home : null;
  const articles =
    newsResult.status === 'fulfilled'
      ? sortNewsNewestFirst(newsResult.value.articles).slice(0, 3)
      : [];

  return (
    <>
      <Hero content={home} />
      <Intro content={home} />
      <Categories />
      <Featured />
      <Services />
      <WhyChoose />
      <Stats />
      <News articles={articles} />
      <QuotationCta />
    </>
  );
}
