'use client';

import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RivetImage } from '@/components/ui/rivet-image';
import { useQuotationModal } from '@/components/quotation/quotation-modal-provider';
import { assets } from '@/lib/assets';

const ease = [0.16, 1, 0.3, 1] as const;

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

export function Hero({ content }: { content?: HeroContent | null }) {
  const ref = useRef<HTMLElement>(null);
  const { open } = useQuotationModal();
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduceMotion ? ['0%', '0%'] : ['0%', '22%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], reduceMotion ? [1, 1] : [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [1, 1.08]);

  const eyebrow = content?.eyebrow?.trim() || defaults.eyebrow;
  const headline = content?.headline?.trim() || defaults.headline;
  const headlineAccent = content?.headlineAccent?.trim() || defaults.headlineAccent;
  const subheadline = content?.subheadline?.trim() || defaults.subheadline;
  const heroImage = content?.heroImage?.trim() || defaults.heroImage;

  const fade = (delay: number) =>
    reduceMotion
      ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 32 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1, ease, delay },
        };

  return (
    <section
      ref={ref}
      className="relative flex h-screen min-h-[720px] items-center overflow-hidden"
      aria-label="Hero"
    >
      <motion.div style={{ y, scale }} className="absolute inset-0 -z-10">
        <RivetImage
          src={heroImage}
          alt="RIVET flagship installation"
          fill
          priority
          sizes="100vw"
          className="scale-105 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/90 via-navy/55 to-navy-deep/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(214,154,46,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,transparent,rgba(0,26,48,0.6))]" />
      </motion.div>

      {/* Architectural grid motif */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-[1280px] px-6 md:px-12">
        <motion.div style={{ opacity }} className="max-w-4xl">
          <motion.div className="rivet-line" {...fade(0.1)}>
            <p className="eyebrow text-gold">{eyebrow}</p>
          </motion.div>

          <motion.h1
            className="headline-display mt-8 text-[2.75rem] text-white sm:text-[3.75rem] lg:text-[5rem]"
            {...fade(0.25)}
          >
            {headline}{' '}
            <span className="italic text-gold-shimmer">{headlineAccent}</span>
          </motion.h1>

          <motion.p
            className="mt-8 max-w-lg text-[1.125rem] font-light leading-[1.75] tracking-wide text-white/75 md:text-[1.25rem]"
            {...fade(0.4)}
          >
            {subheadline}
          </motion.p>

          <motion.div
            className="mt-12 flex flex-wrap items-center gap-5"
            {...fade(0.55)}
          >
            <Link href="/products">
              <Button variant="primary" size="lg">
                Explore Products
              </Button>
            </Link>
            <Button variant="secondary" size="lg" onClick={() => open()}>
              Request a Quotation
            </Button>
            <Link href="/contact">
              <Button variant="ghost" size="lg">
                Contact Us
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gold rule */}
      <div className="absolute inset-x-0 bottom-0 gold-rule opacity-40" aria-hidden="true" />

      <a
        href="#intro"
        className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/50 transition-colors hover:text-gold"
        aria-label="Scroll to content"
      >
        <span className="text-[0.625rem] font-medium uppercase tracking-[0.3em]">Discover</span>
        <ChevronDown
          size={22}
          className={reduceMotion ? undefined : 'animate-[scrollCue_2s_ease-in-out_infinite]'}
          aria-hidden="true"
        />
      </a>
    </section>
  );
}
