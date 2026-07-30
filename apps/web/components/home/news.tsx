import Link from 'next/link';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { RivetImage } from '@/components/ui/rivet-image';
import { FadeUp, Stagger, StaggerItem } from '@/components/motion/reveal';
import { latestNews } from '@/lib/data/content';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function News() {
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

        <Stagger className="grid gap-6 md:grid-cols-3">
          {latestNews.map((n) => (
            <StaggerItem key={n.slug}>
              <Link
                href={`/news/${n.slug}`}
                className="luxury-card group block overflow-hidden rounded-[4px] bg-canvas shadow-[var(--shadow-sm)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <RivetImage
                    src={n.image}
                    alt={n.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-[1.05]"
                  />
                  <span className="absolute left-5 top-5 border border-gold/30 bg-navy-deep/80 px-3 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-gold backdrop-blur-sm">
                    {n.category}
                  </span>
                </div>
                <div className="p-7">
                  <time className="text-[0.75rem] uppercase tracking-[0.18em] text-muted">
                    {formatDate(n.date)}
                  </time>
                  <h3 className="headline-display mt-3 text-[1.25rem] leading-snug transition-colors duration-300 group-hover:text-navy-600">
                    {n.title}
                  </h3>
                  <p className="mt-3 text-[0.9375rem] font-light leading-relaxed text-muted">
                    {n.caption}
                  </p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
