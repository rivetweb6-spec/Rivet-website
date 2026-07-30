import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { RivetImage } from '@/components/ui/rivet-image';
import { FadeUp } from '@/components/motion/reveal';
import { featuredProducts } from '@/lib/data/content';
import { cn } from '@/lib/utils';

export function Featured() {
  return (
    <Section>
      <Container>
        <FadeUp>
          <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Eyebrow>Featured</Eyebrow>
              <h2 className="headline-display mt-5 text-[2.25rem] sm:text-[2.75rem]">
                Selected products
              </h2>
            </div>
            <Link
              href="/products"
              className="gold-underline text-[0.9375rem] font-medium tracking-wide text-navy"
            >
              View all products
            </Link>
          </div>
        </FadeUp>

        <div className="grid gap-5 md:grid-cols-6 md:gap-6">
          {featuredProducts.map((p, i) => {
            const large = i < 2;
            return (
              <FadeUp
                key={p.slug}
                delay={i * 0.08}
                className={cn(large ? 'md:col-span-3' : 'md:col-span-2')}
              >
                <ProductCard {...p} tall={large} />
              </FadeUp>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

function ProductCard({
  slug,
  name,
  category,
  description,
  image,
  tall,
}: {
  slug: string;
  name: string;
  category: string;
  description: string;
  image: string;
  tall?: boolean;
}) {
  return (
    <Link
      href={`/products/${slug}`}
      className="luxury-card group block overflow-hidden rounded-[4px] border border-border/60 bg-canvas shadow-[var(--shadow-sm)]"
    >
      <div className={cn('relative overflow-hidden', tall ? 'aspect-[16/11]' : 'aspect-[4/3]')}>
        <RivetImage
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <div className="flex items-start justify-between gap-4 p-7">
        <div>
          <span className="eyebrow text-gold-muted">{category}</span>
          <h3 className="headline-display mt-2 text-[1.375rem]">{name}</h3>
          <p className="mt-2 text-[0.875rem] font-light leading-relaxed text-muted">
            {description}
          </p>
        </div>
        <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-navy transition-all duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-navy">
          <ArrowUpRight size={17} strokeWidth={1.5} />
        </span>
      </div>
    </Link>
  );
}
