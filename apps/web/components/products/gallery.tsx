'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { RivetImage } from '@/components/ui/rivet-image';
import { cn } from '@/lib/utils';
import type { ProductImage } from '@/lib/api';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';

/**
 * Product image gallery using the WAI-ARIA tabs pattern: thumbnails are tabs,
 * the large image is their tab panel. Only the selected thumbnail is in the
 * Tab order; Left/Right/Home/End move between images.
 */
export function ProductGallery({
  images,
  name,
  aspectClassName = 'aspect-square',
  sizes = '(max-width: 1024px) 100vw, 50vw',
}: {
  images: ProductImage[];
  name: string;
  /** Main image frame ratio (square for products, landscape for categories). */
  aspectClassName?: string;
  sizes?: string;
}) {
  // No photos → a neutral placeholder, never an unrelated stock image.
  const list = images;
  const [active, setActive] = useState(0);
  const current = list[active] ?? list[0];
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabId = (i: number) => `${baseId}-tab-${i}`;
  const panelId = `${baseId}-panel`;

  const select = (i: number) => {
    const next = (i + list.length) % list.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const moves: Record<string, number> = {
      ArrowRight: i + 1,
      ArrowLeft: i - 1,
      Home: 0,
      End: list.length - 1,
    };
    if (e.key in moves) {
      e.preventDefault();
      select(moves[e.key]!);
    }
  };

  const hasTabs = list.length > 1;

  return (
    <div>
      <div
        id={panelId}
        role={hasTabs ? 'tabpanel' : undefined}
        aria-labelledby={hasTabs ? tabId(active) : undefined}
        className={cn('relative overflow-hidden rounded-lg border border-border bg-bg', aspectClassName)}
      >
        {current ? (
          <RivetImage
            key={current.id}
            src={current.url}
            alt={current.alt ?? name}
            fill
            priority
            sizes={sizes}
            className="object-cover"
          />
        ) : (
          <ImagePlaceholder label={`No photo of ${name} yet`} />
        )}
      </div>
      {hasTabs && (
        <div
          className="mt-4 flex gap-3 overflow-x-auto pb-1"
          role="tablist"
          aria-label={`${name} images`}
        >
          {list.map((img, i) => (
            <button
              key={img.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={tabId(i)}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-controls={panelId}
              aria-label={`Image ${i + 1} of ${list.length}`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                'relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 bg-bg transition-[border-color,opacity] ',
                i === active ? 'border-navy dark:border-gold' : 'border-border opacity-75 hover:opacity-100',
              )}
            >
              <RivetImage src={img.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
