import Link from 'next/link';
import { Container, Section, toneClass, type SectionTone } from '@/components/ui/container';
import { RivetImage } from '@/components/ui/rivet-image';
import { ArrowRight } from 'lucide-react';
import { Stagger, StaggerItem } from '@/components/motion/reveal';
import { assets } from '@/lib/assets';
import type { NewsArticle } from '@/lib/api';

function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function News({
  articles,
  tone = 'surface',
}: {
  articles: NewsArticle[];
  tone?: SectionTone;
}) {
  // Hide the whole section until at least one article is published.
  if (articles.length === 0) return null;

  return (
    <Section className={toneClass(tone)}>
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-12">
          <div>
            <h2 className="headline-display text-4xl sm:text-6xl">Latest news</h2>
          </div>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy underline-offset-4 hover:underline"
          >
            All news
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        {articles.length === 0 ? (
          <p className="text-center text-muted">No news articles have been published yet.</p>
        ) : (
          <Stagger className="grid gap-5 md:grid-cols-3 lg:gap-6">
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
                      sizes="(max-width: 768px) 100vw, 33vw"
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
                    <h3 className="mt-2 text-xl leading-snug transition-colors group-hover:underline group-focus-visible:underline group-hover:underline-offset-4">
                      {n.title}
                    </h3>
                    {n.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                        {n.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </Container>
    </Section>
  );
}
