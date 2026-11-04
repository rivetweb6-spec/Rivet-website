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

/** About-the-company teaser: image beside kicker, title and two paragraphs (CMS-driven). */
export function Intro({ content }: { content?: IntroContent | null }) {
  const eyebrow = content?.introEyebrow?.trim() || defaults.introEyebrow;
  const title = content?.introTitle?.trim() || defaults.introTitle;
  const body = content?.introBody?.trim() || defaults.introBody;
  const bodySecondary = content?.introBodySecondary?.trim() || defaults.introBodySecondary;
  const image = content?.introImage?.trim() || defaults.introImage;

  return (
    <Section id="intro">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <FadeUp>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[8px] bg-bg">
              <RivetImage
                src={image}
                alt="RIVET showroom and imported architectural products in Ethiopia"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </FadeUp>
          <FadeUp delay={0.08}>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className="headline-display mt-3 text-[2rem] sm:text-[2.5rem]">{title}</h2>
            <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink/85">{body}</p>
            <p className="mt-4 leading-relaxed text-muted">{bodySecondary}</p>
            <Link
              href="/company"
              className="mt-8 inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-navy underline-offset-4 hover:underline"
            >
              About River Company
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </FadeUp>
        </div>
      </Container>
    </Section>
  );
}
