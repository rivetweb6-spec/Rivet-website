'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { RivetImage } from '@/components/ui/rivet-image';
import { cn } from '@/lib/utils';
import type { ProductImage } from '@/lib/api';
import { assets } from '@/lib/assets';

/**
 * Product image gallery using the WAI-ARIA tabs pattern: thumbnails are tabs,
 * the large image is their tab panel. Only the selected thumbnail is in the
 * Tab order; Left/Right/Home/End move between images.
 */
export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const list = images.length
    ? images
    : [{ id: 'fallback', url: assets.products.p1, alt: name, publicId: null, order: 0 }];
  const [active, setActive] = useState(0);
  const current = list[active] ?? list[0]!;
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
        className="relative aspect-[4/5] overflow-hidden rounded-[12px] bg-bg shadow-[var(--shadow-lg)]"
      >
        <RivetImage
          key={current.id}
          src={current.url}
          alt={current.alt ?? name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 hover:scale-[1.04]"
        />
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
                'relative h-20 w-20 shrink-0 overflow-hidden rounded-[8px] border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
                i === active ? 'border-gold' : 'border-transparent opacity-70 hover:opacity-100',
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
