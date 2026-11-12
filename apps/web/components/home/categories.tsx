import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { RivetImage } from '@/components/ui/rivet-image';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { Stagger, StaggerItem } from '@/components/motion/reveal';
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

/** Department entry points: photo tiles with the department name on a bottom scrim. */
export function Categories({ items }: { items?: CategoryCard[] }) {
  // `undefined` = API unreachable (dev fallback OK). `[]` = API empty — do not invent links.
  const list =
    items === undefined
      ? fallbackCategories.map((c) => ({ slug: c.slug, name: c.name, image: c.image }))
      : items;

  if (list.length === 0) return null;

  return (
    <Section className="bg-surface">
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-12">
          <div className="max-w-2xl">
            <Eyebrow>Product departments</Eyebrow>
            <h2 className="headline-display mt-3 text-4xl sm:text-6xl">Elevator solutions and building products</h2>
            <p className="mt-4 leading-relaxed text-muted">
              Elevators, passenger lifts and escalators alongside granite, doors, furniture, sanitary
              goods and building materials — sourced for projects in Ethiopia.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy underline-offset-4 hover:underline"
          >
            View all products
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {list.map((c) => (
            <StaggerItem key={c.slug}>
              <Link
                href={`/products/${c.slug}`}
                className="group relative block aspect-[4/3] overflow-hidden rounded-lg bg-navy-deep"
              >
                {c.image || FALLBACK_IMAGES[c.slug] ? (
                  <RivetImage
                    src={(c.image || FALLBACK_IMAGES[c.slug])!}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <ImagePlaceholder />
                )}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-navy-deep/85 via-navy-deep/20 to-transparent"
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:p-5">
                  <h3 className="text-base font-semibold text-white md:text-lg">
                    {c.name}
                  </h3>
                  <ArrowRight
                    size={18}
                    className="mb-0.5 shrink-0 text-white/80 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-gold"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
