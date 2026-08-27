'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { RivetImage } from '@/components/ui/rivet-image';

export type LightboxItem = {
  src: string;
  title: string;
  description?: string | null;
};

export function ImageLightbox({
  items,
  index,
  onClose,
  onIndexChange,
  labelledBy = 'image-lightbox-title',
}: {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  labelledBy?: string;
}) {
  const item = items[index];
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onIndexChange((index - 1 + items.length) % items.length);
      if (e.key === 'ArrowRight') onIndexChange((index + 1) % items.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, items.length, onClose, onIndexChange]);

  if (!mounted || !item?.src) return null;

  const content = (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-navy/92 p-4 md:p-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-zoom-out"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-full w-full max-w-5xl flex-col">
        <div className="relative h-[70vh] w-full overflow-hidden rounded-[16px] bg-white">
          <RivetImage
            src={item.src}
            alt={item.title}
            fill
            sizes="(max-width: 1024px) 100vw, 960px"
            className="object-contain p-4 sm:p-8"
          />
        </div>
        <div className="mt-5 flex items-start justify-between gap-4 text-white">
          <div>
            <h3 id={labelledBy} className="text-[1.25rem]">
              {item.title}
            </h3>
            {item.description && (
              <p className="mt-1 max-w-2xl text-[0.9375rem] text-white/70">{item.description}</p>
            )}
          </div>
          <p className="shrink-0 text-[0.75rem] uppercase tracking-[0.16em] text-gold">
            {index + 1} / {items.length}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white hover:border-gold hover:text-gold"
        aria-label="Close"
      >
        <X size={18} />
      </button>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => onIndexChange((index - 1 + items.length) % items.length)}
            className="absolute top-1/2 left-3 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 text-white hover:border-gold hover:text-gold md:left-6"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => onIndexChange((index + 1) % items.length)}
            className="absolute top-1/2 right-3 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 text-white hover:border-gold hover:text-gold md:right-6"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );

  return createPortal(content, document.body);
}

export function extraImages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

export function allItemImages(item: { image: string | null; images?: unknown }): string[] {
  return [item.image, ...extraImages(item.images)].filter(
    (url): url is string => typeof url === 'string' && url.length > 0,
  );
}
