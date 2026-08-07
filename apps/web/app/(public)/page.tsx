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
  let home = null;
  try {
    const res = await api.home();
    home = res.home;
  } catch {
    /* fall back to hardcoded defaults in Hero / Intro */
  }

  return (
    <>
      <Hero content={home} />
      <Intro content={home} />
      <Categories />
      <Featured />
      <Services />
      <WhyChoose />
      <Stats />
      <News />
      <QuotationCta />
    </>
  );
}
