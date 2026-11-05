import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button-variants';
import { RivetImage } from '@/components/ui/rivet-image';
import { RequestQuotationButton } from '@/components/quotation/request-quotation-button';
import { HOME_COPY } from '@/lib/data/home-copy';

export type HeroContent = {
  eyebrow?: string | null;
  headline?: string | null;
  headlineAccent?: string | null;
  subheadline?: string | null;
  heroImage?: string | null;
};

/** Bundled hero photo (public/images). Admin → Homepage can still override it. */
const HERO_IMAGE = '/images/rivet-elevator-hero.webp';

const defaults = {
  eyebrow: HOME_COPY.eyebrow,
  headline: HOME_COPY.headline,
  headlineAccent: HOME_COPY.headlineAccent,
  subheadline: HOME_COPY.subheadline,
  heroImage: HERO_IMAGE,
};

/**
 * Homepage hero — server-rendered, no entrance or scroll animation (fast
 * first paint, no layout shift, nothing to hydrate except the quotation CTA).
 * Text comes from the CMS (Admin → Homepage) with brand defaults.
 */
export function Hero({ content }: { content?: HeroContent | null }) {
  const eyebrow = content?.eyebrow?.trim() || defaults.eyebrow;
  const headline = content?.headline?.trim() || defaults.headline;
  const headlineAccent = content?.headlineAccent?.trim() || defaults.headlineAccent;
  const subheadline = content?.subheadline?.trim() || defaults.subheadline;
  const heroImage = content?.heroImage?.trim() || defaults.heroImage;

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[560px] items-center overflow-hidden bg-navy-deep pt-[4.5rem] md:min-h-[min(85vh,760px)]"
    >
      {/* Full-bleed on mobile/tablet; on desktop the photo is anchored right and its
          left edge fades into the navy so the elevator sits beside the text. */}
      <div
        className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[78%] lg:[mask-image:linear-gradient(to_right,transparent,#000_30%)]"
        aria-hidden="true"
      >
        {/* Single static photo (no slideshow). */}
        <RivetImage
          src={heroImage}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 78vw, 100vw"
          className="object-cover object-[72%_center] lg:object-center"
        />
      </div>
      {/* Navy scrim, strongest on the left behind the text; heavier on mobile where text covers the photo. */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-deep/95 via-navy-deep/80 to-navy-deep/55 md:via-navy-deep/70 md:to-navy-deep/10 lg:via-navy-deep/55 lg:to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-[1280px] px-5 py-16 sm:px-6 md:py-20 lg:px-10">
        <div className="max-w-2xl">
          <p className="rivet-line eyebrow text-gold">{eyebrow}</p>
          <h1
            id="hero-title"
            className="headline-display mt-6 text-[2.5rem] text-white sm:text-[3.25rem] lg:text-[4rem]"
          >
            {headline} <span className="text-gold">{headlineAccent}</span>
          </h1>
          <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-white/85 md:text-[1.1875rem]">
            {subheadline}
          </p>

          {/* Phones: full-width stacked buttons; sm+: inline row. */}
          <div className="mt-9 grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
            <RequestQuotationButton />
            <Link href="/products" className={buttonVariants({ variant: 'ghost', size: 'lg' })}>
              Explore products
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-1.5 py-2 text-[0.9375rem] sm:ml-1 sm:py-0 font-semibold text-white/90 underline-offset-[6px] hover:text-white hover:underline"
            >
              Contact us
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
