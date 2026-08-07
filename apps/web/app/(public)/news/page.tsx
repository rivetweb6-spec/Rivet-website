import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHero } from '@/components/site/page-hero';
import { Container, Section } from '@/components/ui/container';
import { RivetImage } from '@/components/ui/rivet-image';
import { FadeUp, Stagger, StaggerItem } from '@/components/motion/reveal';
import { api } from '@/lib/api';
import { assets } from '@/lib/assets';
import { resolveSeo } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  let page = null;
  try {
    ({ page } = await api.pageSeo.byKey('news'));
  } catch {
    /* defaults */
  }
  return resolveSeo(page, {
    title: 'News & Insights | Rivet',
    description:
      'Journal of RIVET projects, product launches and company updates across Ethiopia and East Africa.',
    path: '/news',
  });
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
  const { articles } = await api.news.list({ pageSize: 12 });

  return (
    <>
      <PageHero
        eyebrow="Journal"
        title="Latest news"
        description="Stories from the showroom, the factory floor, and the projects we supply."
      />
      <Section>
        <Container>
          {articles.length === 0 ? (
            <p className="text-center text-muted">No articles published yet.</p>
          ) : (
            <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((n) => (
                <StaggerItem key={n.id}>
                  <Link
                    href={`/news/${n.slug}`}
                    className="group block overflow-hidden rounded-[16px] bg-surface shadow-[var(--shadow-sm)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lg)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <RivetImage
                        src={n.coverImage ?? assets.news.n1}
                        alt={n.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                      />
                      {n.category && (
                        <span className="absolute left-4 top-4 rounded-full bg-surface/90 px-3 py-1 text-[0.75rem] font-semibold text-navy backdrop-blur">
                          {n.category}
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <time className="text-[0.75rem] uppercase tracking-[0.14em] text-muted">
                        {formatDate(n.publishedAt)}
                      </time>
                      <h2 className="mt-3 text-[1.25rem] leading-snug">{n.title}</h2>
                      {n.excerpt && <p className="mt-2 text-[0.9375rem] text-muted">{n.excerpt}</p>}
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
