import Link from 'next/link';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { RivetImage } from '@/components/ui/rivet-image';
import { FadeUp, Stagger, StaggerItem } from '@/components/motion/reveal';
import { categories as fallbackCategories } from '@/lib/data/content';
import { assets } from '@/lib/assets';

export type CategoryCard = {
  slug: string;
  name: string;
  image: string | null;
};

const FALLBACK_IMAGES: Record<string, string> = {
  elevators: assets.categories.elevators,
  'passenger-lifts': assets.categories.lifts,
  escalators: assets.categories.escalators,
  granite: assets.categories.granite,
  doors: assets.categories.doors,
  chairs: assets.categories.chairs,
  'office-furniture': assets.categories.furniture,
  'sanitary-goods': assets.categories.sanitary,
  'building-materials': assets.categories.materials,
};

export function Categories({ items }: { items?: CategoryCard[] }) {
  // `undefined` = API unreachable (dev fallback OK). `[]` = API empty — do not invent links.
  const list =
    items === undefined
      ? fallbackCategories.map((c) => ({ slug: c.slug, name: c.name, image: c.image }))
      : items;

  if (list.length === 0) return null;

  return (
    <Section className="bg-pearl">
      <Container>
        <FadeUp>
          <div className="mb-16 max-w-2xl">
            <Eyebrow>Shop by Department</Eyebrow>
            <h2 className="headline-display mt-5 text-[2.25rem] sm:text-[2.75rem]">
              Product categories
            </h2>
            <p className="mt-5 font-light leading-relaxed text-muted">
              A curated portfolio spanning vertical transportation, natural stone, and architectural
              essentials.
            </p>
          </div>
        </FadeUp>

        <Stagger className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
          {list.map((c) => (
            <StaggerItem key={c.slug}>
              <Link
                href={`/products/${c.slug}`}
                className="group relative block aspect-[4/3] overflow-hidden rounded-[4px]"
              >
                <RivetImage
                  src={c.image || FALLBACK_IMAGES[c.slug] || assets.categories.materials}
                  alt={`Premium ${c.name} supplied by Rivet in Ethiopia`}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy/25 to-navy/5 transition-all duration-700 group-hover:from-navy-deep/95" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                  <span className="inline-block h-px w-10 bg-gold transition-all duration-700 group-hover:w-16" />
                  <h3 className="headline-display mt-3 text-[1.25rem] text-white md:text-[1.375rem]">
                    {c.name}
                  </h3>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
