import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHero } from '@/components/site/page-hero';
import { Container, Section } from '@/components/ui/container';
import { RivetImage } from '@/components/ui/rivet-image';
import { FadeUp, Stagger, StaggerItem } from '@/components/motion/reveal';
import { Newspaper } from 'lucide-react';
import { StateMessage } from '@/components/ui/state-message';
import { buttonVariants } from '@/components/ui/button-variants';
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
        eyebrow="News"
        title="News & updates"
        description="Company announcements, product updates and project news from RIVET COMPANY."
      />
      <Section>
        <Container>
          {articles.length === 0 ? (
            <StateMessage
              icon={Newspaper}
              title="No news articles yet"
              actions={
                <Link href="/products" className={buttonVariants({ variant: 'outline', size: 'md' })}>
                  Browse products
                </Link>
              }
            >
              Company announcements and project updates will appear here.
            </StateMessage>
          ) : (
            <Stagger className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:gap-6">
              {articles.map((n) => (
                <StaggerItem key={n.id}>
                  <Link
                    href={`/news/${n.slug}`}
                    className="luxury-card group flex h-full flex-col overflow-hidden rounded-lg bg-canvas"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-bg">
                      <RivetImage
                        src={n.coverImage ?? assets.news.n1}
                        alt={`${n.title} — RIVET COMPANY news`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                      {n.category && (
                        <span className="absolute left-4 top-4 rounded-sm bg-navy px-2.5 py-1 text-3xs font-semibold text-white">
                          {n.category}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5 md:p-6">
                      <time className="text-xs text-muted">
                        {formatDate(n.publishedAt)}
                      </time>
                      <h2 className="mt-2 text-xl leading-snug group-hover:underline group-focus-visible:underline group-hover:underline-offset-4">{n.title}</h2>
                      {n.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{n.excerpt}</p>}
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
