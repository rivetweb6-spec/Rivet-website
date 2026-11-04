import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button-variants';
import { RivetImage } from '@/components/ui/rivet-image';
import { RequestQuotationButton } from '@/components/quotation/request-quotation-button';
import { assets } from '@/lib/assets';

export type HeroContent = {
  eyebrow?: string | null;
  headline?: string | null;
  headlineAccent?: string | null;
  subheadline?: string | null;
  heroImage?: string | null;
};

const defaults = {
  eyebrow: 'River Company · Premium Imports',
  headline: 'Engineering the architecture',
  headlineAccent: 'of ambition.',
  subheadline:
    'Elevators, granite, doors and fine building materials — imported with precision, installed with mastery.',
  heroImage: assets.hero.image,
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
      className="relative isolate flex min-h-[560px] items-center overflow-hidden bg-navy-deep pt-[4.5rem] md:h-[min(85vh,760px)]"
    >
      <RivetImage
        src={heroImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      {/* One directional scrim keeps text readable over any photo. */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-deep/95 via-navy-deep/80 to-navy-deep/30"
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

          <div className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
            <RequestQuotationButton />
            <Link href="/products" className={buttonVariants({ variant: 'ghost', size: 'lg' })}>
              Explore products
            </Link>
            <Link
              href="/contact"
              className="ml-1 inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-white/90 underline-offset-[6px] hover:text-white hover:underline"
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
