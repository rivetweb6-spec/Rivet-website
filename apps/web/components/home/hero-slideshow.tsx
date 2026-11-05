'use client';

import * as React from 'react';
import { RivetImage } from '@/components/ui/rivet-image';
import { cn } from '@/lib/utils';

export type HeroSlide = {
  src: string;
  /** Tailwind object-position classes, e.g. to keep the subject visible on phones. */
  position?: string;
};

const SLIDE_MS = 6500;

/**
 * Background slideshow for the home hero: slowly cross-fades between photos
 * while the visible one zooms in a little. Decorative only (alt=""). With
 * reduced motion enabled it simply shows the first photo.
 */
export function HeroSlideshow({ slides, sizes }: { slides: HeroSlide[]; sizes: string }) {
  const [index, setIndex] = React.useState(0);
  // The outgoing slide keeps its zoom while it fades, so it never snaps back.
  const [previous, setPrevious] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      // Don't advance while the tab is hidden; resume where it left off.
      if (document.visibilityState === 'visible') {
        setIndex((i) => {
          setPrevious(i);
          return (i + 1) % slides.length;
        });
      }
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <>
      {slides.map((slide, i) => {
        const active = i === index;
        const zooming = active || i === previous;
        return (
          <div
            key={slide.src}
            className={cn(
              'absolute inset-0 transition-opacity duration-[1600ms] ease-in-out',
              active ? 'opacity-100' : 'opacity-0',
            )}
          >
            <RivetImage
              src={slide.src}
              alt=""
              fill
              priority={i === 0}
              sizes={sizes}
              className={cn(
                'object-cover will-change-transform',
                slide.position ?? 'object-center',
                // Zoom restarts each time a slide comes back around.
                zooming && 'animate-[heroZoom_8s_ease-out_forwards]',
              )}
            />
          </div>
        );
      })}
    </>
  );
}
