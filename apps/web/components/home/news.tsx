import Link from 'next/link';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { RivetImage } from '@/components/ui/rivet-image';
import { FadeUp, Stagger, StaggerItem } from '@/components/motion/reveal';
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

export function News({ articles }: { articles: NewsArticle[] }) {
  return (
    <Section className="bg-pearl">
      <Container>
        <FadeUp>
          <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>Journal</Eyebrow>
              <h2 className="headline-display mt-5 text-[2.25rem] sm:text-[2.75rem]">
                Latest news
              </h2>
            </div>
            <Link
              href="/news"
              className="gold-underline text-[0.9375rem] font-medium tracking-wide text-navy"
            >
              Read the journal
            </Link>
          </div>
        </FadeUp>

        {articles.length === 0 ? (
          <p className="text-center text-muted">No articles published yet.</p>
        ) : (
          <Stagger className="grid gap-6 md:grid-cols-3">
            {articles.map((n) => (
              <StaggerItem key={n.id}>
                <Link
                  href={`/news/${n.slug}`}
                  className="luxury-card group block overflow-hidden rounded-[4px] bg-canvas shadow-[var(--shadow-sm)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <RivetImage
                      src={n.coverImage ?? assets.news.n1}
                      alt={n.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-[1.05]"
                    />
                    {n.category && (
                      <span className="absolute left-5 top-5 border border-gold/30 bg-navy-deep/80 px-3 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-gold backdrop-blur-sm">
                        {n.category}
                      </span>
                    )}
                  </div>
                  <div className="p-7">
                    <time className="text-[0.75rem] uppercase tracking-[0.18em] text-muted">
                      {formatDate(n.publishedAt)}
                    </time>
                    <h3 className="headline-display mt-3 text-[1.25rem] leading-snug transition-colors duration-300 group-hover:text-navy-600">
                      {n.title}
                    </h3>
                    {n.excerpt && (
                      <p className="mt-3 text-[0.9375rem] font-light leading-relaxed text-muted">
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
