import type { Metadata } from 'next';
import { Hero } from '@/components/home/hero';
import { Intro } from '@/components/home/intro';
import { Categories } from '@/components/home/categories';
import { Featured } from '@/components/home/featured';
import { Services } from '@/components/home/services';
import { WhyChoose } from '@/components/home/why-choose';
import { Stats } from '@/components/home/stats';
import { News } from '@/components/home/news';
import { DemoCta } from '@/components/home/demo-cta';
import { pageMetadata } from '@/lib/seo';
import { api } from '@/lib/api';

export const metadata: Metadata = pageMetadata({
  title: 'Premium Construction & Architectural Products',
  path: '/',
});

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
      <DemoCta />
    </>
  );
}
