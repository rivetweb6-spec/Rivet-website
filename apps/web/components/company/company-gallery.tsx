'use client';

import * as React from 'react';
import { FadeUp, Stagger, StaggerItem } from '@/components/motion/reveal';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { RivetImage } from '@/components/ui/rivet-image';
import { ImageLightbox } from '@/components/company/image-lightbox';
import type { GalleryCategory, GalleryImage } from '@/lib/api';
import { cn } from '@/lib/utils';

const FILTERS: { id: 'ALL' | GalleryCategory; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'PHOTOS', label: 'Company photos' },
  { id: 'ACTIVITIES', label: 'Activities' },
  { id: 'PROJECTS', label: 'Projects' },
  { id: 'EVENTS', label: 'Events' },
  { id: 'OTHER', label: 'Other' },
];

export function CompanyGalleryGrid({ images }: { images: GalleryImage[] }) {
  const [filter, setFilter] = React.useState<'ALL' | GalleryCategory>('ALL');
  const [active, setActive] = React.useState<number | null>(null);

  const visible = filter === 'ALL' ? images : images.filter((item) => item.category === filter);
  const available = FILTERS.filter(
    (f) => f.id === 'ALL' || images.some((item) => item.category === f.id),
  );

  const lightboxItems = visible.map((item) => ({
    src: item.image,
    title: item.title,
    description: item.description,
  }));

  if (images.length === 0) {
    return (
      <Section>
        <Container>
          <p className="text-center text-muted">
            Gallery images will appear here once they are published.
          </p>
        </Container>
      </Section>
    );
  }

  return (
    <>
      <Section>
        <Container>
          <FadeUp>
            <Eyebrow>Archive</Eyebrow>
            <h2 className="mt-3 text-[2rem] md:text-[2.5rem]">Moments from the company</h2>
            <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-muted">
              Photos from the showroom, site, and the work in between.
            </p>
          </FadeUp>

          {available.length > 2 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {available.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setFilter(f.id);
                    setActive(null);
                  }}
                  className={cn(
                    'rounded-full border px-4 py-2 text-[0.8125rem] tracking-wide transition-colors',
                    filter === f.id
                      ? 'border-gold bg-gold text-navy'
                      : 'border-border text-muted hover:border-gold hover:text-navy',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {visible.length === 0 ? (
            <p className="mt-12 text-muted">No images in this category yet.</p>
          ) : (
            <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((item, index) => (
                <StaggerItem key={item.id}>
                  <button
                    type="button"
                    onClick={() => setActive(index)}
                    className="group relative block w-full overflow-hidden rounded-[16px] text-left"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <RivetImage
                        src={item.image}
                        alt={`${item.title} — River Company gallery`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                      />
                    </div>
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 to-transparent px-5 py-4 pt-16">
                      <span className="block text-[1rem] text-white">{item.title}</span>
                      {item.description && (
                        <span className="mt-1 line-clamp-2 block text-[0.8125rem] text-white/70">
                          {item.description}
                        </span>
                      )}
                    </span>
                  </button>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </Container>
      </Section>

      {active !== null && (
        <ImageLightbox
          items={lightboxItems}
          index={active}
          onClose={() => setActive(null)}
          onIndexChange={setActive}
          labelledBy="gallery-lightbox-title"
        />
      )}
    </>
  );
}
