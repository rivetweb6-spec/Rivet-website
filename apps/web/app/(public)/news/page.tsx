import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHero } from '@/components/site/page-hero';
import { Container, Section } from '@/components/ui/container';
import { RivetImage } from '@/components/ui/rivet-image';
import { FadeUp, Stagger, StaggerItem } from '@/components/motion/reveal';
import { api } from '@/lib/api';
import { assets } from '@/lib/assets';
import { sortNewsNewestFirst } from '@/lib/news';
import { metadataForStaticPage } from '@/lib/page-seo';

/** CMS-backed; skip static prerender so `next build` does not require a live API. */
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return metadataForStaticPage('news');
}

function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function NewsPage() {
  const { articles: raw } = await api.news.list({ pageSize: 12 });
  const articles = sortNewsNewestFirst(raw);

  return (
    <>
      <PageHero
        eyebrow="Journal"
        title="News & insights"
        description="Stories from the showroom, the factory floor, and the projects we supply."
      />
      <Section>
        <Container>
          {articles.length === 0 ? (
            <p className="rounded-[8px] border border-dashed border-border bg-surface p-10 text-center text-muted">No articles published yet.</p>
          ) : (
            <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {articles.map((n) => (
                <StaggerItem key={n.id}>
                  <Link
                    href={`/news/${n.slug}`}
                    className="luxury-card group flex h-full flex-col overflow-hidden rounded-[8px] bg-canvas"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-bg">
                      <RivetImage
                        src={n.coverImage ?? assets.news.n1}
                        alt={`${n.title} — RIVET news`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      />
                      {n.category && (
                        <span className="absolute left-4 top-4 rounded-[4px] bg-navy px-2.5 py-1 text-[0.75rem] font-semibold text-white">
                          {n.category}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5 md:p-6">
                      <time className="text-[0.875rem] text-muted">
                        {formatDate(n.publishedAt)}
                      </time>
                      <h2 className="mt-2 text-[1.1875rem] leading-snug group-hover:underline group-hover:underline-offset-4">{n.title}</h2>
                      {n.excerpt && <p className="mt-2 line-clamp-3 text-[0.9375rem] leading-relaxed text-muted">{n.excerpt}</p>}
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </Container>
      </Section>
    </>
  );
}
