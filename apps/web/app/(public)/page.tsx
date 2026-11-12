import type { Metadata } from 'next';
import { Hero } from '@/components/home/hero';
import { Intro } from '@/components/home/intro';
import { ManagementMessages } from '@/components/home/management-messages';
import { Directory, type DirectoryEntry } from '@/components/home/directory';
import { Featured } from '@/components/home/featured';
import { Services } from '@/components/home/services';
import { News } from '@/components/home/news';
import { QuotationCta } from '@/components/home/quotation-cta';
import type { SectionTone } from '@/components/ui/container';
import { metadataForStaticPage } from '@/lib/page-seo';
import { api } from '@/lib/api';
import { buildCategoryTree, countSubtreeProducts } from '@/lib/category-tree';
import { sortNewsNewestFirst } from '@/lib/news';

/** CMS-backed; skip static prerender so `next build` does not require a live API. */
export const dynamic = 'force-dynamic';

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
  // Directory rows: each top-level department with its ranges and the
  // products listed across the whole department.
  const departments: DirectoryEntry[] | undefined =
    categoriesResult.status === 'fulfilled'
      ? buildCategoryTree(categoriesResult.value.categories).map((root) => ({
          slug: root.slug,
          name: root.name,
          rangeCount: root.children.length,
          productCount: countSubtreeProducts(root),
        }))
      : undefined;

  let featured:
    | {
        slug: string;
        name: string;
        category: string;
        description: string;
        image: string | null;
      }[]
    | undefined =
    featuredResult.status === 'fulfilled'
      ? featuredResult.value.products.map((p) => ({
          slug: p.slug,
          name: p.name,
          category: p.category?.name ?? 'Product',
          description: p.shortDescription ?? '',
          image: p.images[0]?.url ?? null,
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
        image: p.images[0]?.url ?? null,
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

  // Alternate backgrounds across the sections that will actually render
  // (a section hides itself when it has nothing to show). The directory
  // above them is always white, so the first one starts on the grey tone.
  // `undefined` data means "API down": those sections show local fallbacks.
  const shown = {
    featured: featured === undefined || featured.length > 0,
    intro: true,
    services: services === undefined || services.length > 0,
    management: true,
    news: articles.length > 0,
  };
  const tones: Partial<Record<keyof typeof shown, SectionTone>> = {};
  let next: SectionTone = 'surface';
  for (const key of Object.keys(shown) as (keyof typeof shown)[]) {
    if (!shown[key]) continue;
    tones[key] = next;
    next = next === 'surface' ? 'canvas' : 'surface';
  }

  // Order: the one primary task (find a department) straight after the
  // hero, then proof (products, who we are), then services, people, news.
  // Retired from this page but kept in the codebase: Highlights (replaced by
  // the directory), Categories photo grid (same links as the directory),
  // WhyChoose (merged into Intro).
  return (
    <>
      <Hero content={home} />
      <Directory items={departments} />
      <Featured products={featured} tone={tones.featured} />
      <Intro content={home} tone={tones.intro} />
      <Services items={services} tone={tones.services} />
      <ManagementMessages content={home} tone={tones.management} />
      <News articles={articles} tone={tones.news} />
      <QuotationCta />
    </>
  );
}
