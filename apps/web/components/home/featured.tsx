import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container, Section, toneClass, type SectionTone } from '@/components/ui/container';
import { RivetImage } from '@/components/ui/rivet-image';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { Stagger, StaggerItem } from '@/components/motion/reveal';
import { featuredProducts as fallbackProducts } from '@/lib/data/content';
import { buildProductAltText } from '@/lib/seo';

export type FeaturedProductCard = {
  slug: string;
  name: string;
  category: string;
  description: string;
  /** null when the product has no photo yet (shows a neutral placeholder). */
  image: string | null;
};

/** Featured products — same card language as the catalog. */
export function Featured({
  products,
  tone = 'surface',
}: {
  products?: FeaturedProductCard[];
  tone?: SectionTone;
}) {
  // `undefined` = API unreachable (dev fallback OK). `[]` = API empty — do not invent links.
  const list = products === undefined ? fallbackProducts : products;

  if (list.length === 0) return null;

  return (
    <Section className={toneClass(tone)}>
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-12">
          <div className="max-w-2xl">
            <h2 className="headline-display text-4xl sm:text-6xl">Featured products</h2>
          </div>
          <Link
            href="/products?view=all"
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy underline-offset-4 hover:underline"
          >
            View all products
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <Stagger className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:gap-6">
          {list.slice(0, list.length >= 6 ? 6 : list.length >= 3 ? 3 : list.length).map((p) => (
            <StaggerItem key={p.slug}>
              <ProductCard {...p} />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}

function ProductCard({ slug, name, category, description, image }: FeaturedProductCard) {
  return (
    <Link
      href={`/products/${slug}`}
      className="luxury-card group flex h-full flex-col overflow-hidden rounded-lg bg-canvas"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-bg">
        {image ? (
          <RivetImage
            src={image}
            alt={buildProductAltText(name, category, description)}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <span className="eyebrow text-gold-ink">{category}</span>
        <h3 className="mt-2 text-xl">{name}</h3>
        {description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{description}</p>
        )}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-navy">
          View product
          <ArrowRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}
