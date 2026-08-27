import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { RivetImage } from '@/components/ui/rivet-image';
import { FadeUp } from '@/components/motion/reveal';
import { assets } from '@/lib/assets';

export type IntroContent = {
  introEyebrow?: string | null;
  introTitle?: string | null;
  introBody?: string | null;
  introBodySecondary?: string | null;
  introImage?: string | null;
};

const defaults = {
  introEyebrow: 'The River Company Standard',
  introTitle: 'A flagship of imported precision.',
  introBody:
    "For nearly two decades, RIVET has brought the world's finest construction and architectural products to landmark projects — from machine-room-less elevators to full-slab granite and engineered building materials.",
  introBodySecondary:
    'We operate the way we build: with restraint, precision, and an obsession for the details that others overlook.',
  introImage: assets.intro.image,
};

export function Intro({ content }: { content?: IntroContent | null }) {
  const eyebrow = content?.introEyebrow?.trim() || defaults.introEyebrow;
  const title = content?.introTitle?.trim() || defaults.introTitle;
  const body = content?.introBody?.trim() || defaults.introBody;
  const bodySecondary = content?.introBodySecondary?.trim() || defaults.introBodySecondary;
  const image = content?.introImage?.trim() || defaults.introImage;

  return (
    <Section id="intro" className="luxury-grain">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          <FadeUp>
            <div className="frame-offset relative ml-4 aspect-[4/5] overflow-hidden rounded-[4px] shadow-[var(--shadow-luxury)]">
              <RivetImage
                src={image}
                alt="RIVET showroom and imported architectural products in Ethiopia"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-[1.2s] ease-out hover:scale-[1.03]"
              />
            </div>
          </FadeUp>
          <FadeUp delay={0.15}>
            <div className="rivet-line lg:pl-8">
              <Eyebrow>{eyebrow}</Eyebrow>
              <h2 className="headline-display mt-5 text-[2.25rem] sm:text-[2.75rem] lg:text-[3rem]">
                {title}
              </h2>
              <p className="mt-7 text-[1.0625rem] font-light leading-[1.8] text-muted">{body}</p>
              <p className="mt-5 font-light leading-[1.8] text-muted">{bodySecondary}</p>
              <Link
                href="/company"
                className="gold-underline mt-10 inline-flex items-center gap-3 text-[0.9375rem] font-medium tracking-wide text-navy"
              >
                Learn more about us
                <ArrowRight size={16} className="text-gold" strokeWidth={1.5} />
              </Link>
            </div>
          </FadeUp>
        </div>
      </Container>
    </Section>
  );
}
