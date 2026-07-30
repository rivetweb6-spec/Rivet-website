'use client';

import { useState } from 'react';
import { RivetImage } from '@/components/ui/rivet-image';
import { cn } from '@/lib/utils';
import type { ProductImage } from '@/lib/api';
import { assets } from '@/lib/assets';

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const list = images.length
    ? images
    : [{ id: 'fallback', url: assets.products.p1, alt: name, publicId: null, order: 0 }];
  const [active, setActive] = useState(0);
  const current = list[active] ?? list[0]!;

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-bg shadow-[var(--shadow-lg)]">
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
      {list.length > 1 && (
        <div
          className="mt-4 flex gap-3 overflow-x-auto pb-1"
          role="tablist"
          aria-label={`${name} image gallery`}
        >
          {list.map((img, i) => (
            <button
              key={img.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`View image ${i + 1} of ${list.length}`}
              onClick={() => setActive(i)}
              className={cn(
                'relative h-20 w-20 shrink-0 overflow-hidden rounded-[12px] border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
                i === active ? 'border-gold' : 'border-transparent opacity-70 hover:opacity-100',
              )}
            >
              <RivetImage
                src={img.url}
                alt={img.alt ?? `${name} thumbnail ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
