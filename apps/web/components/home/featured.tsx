import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container, Section, toneClass, type SectionTone } from '@/components/ui/container';
import { ProductTile } from '@/components/products/product-tile';
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

        {/* Same card as the catalog (shared ProductTile). */}
        <ul className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:gap-6">
          {list.slice(0, list.length >= 6 ? 6 : list.length >= 3 ? 3 : list.length).map((p) => (
            <li key={p.slug}>
              <ProductTile
                href={`/products/${p.slug}`}
                name={p.name}
                description={p.description}
                image={p.image}
                imageAlt={buildProductAltText(p.name, p.category, p.description)}
                category={p.category}
              />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
