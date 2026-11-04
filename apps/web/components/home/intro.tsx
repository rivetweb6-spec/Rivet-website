import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { RivetImage } from '@/components/ui/rivet-image';
import { FadeUp } from '@/components/motion/reveal';
import { assets } from '@/lib/assets';
import { HOME_COPY } from '@/lib/data/home-copy';

export type IntroContent = {
  introEyebrow?: string | null;
  introTitle?: string | null;
  introBody?: string | null;
  introBodySecondary?: string | null;
  introImage?: string | null;
};

const defaults = {
  introEyebrow: HOME_COPY.introEyebrow,
  introTitle: HOME_COPY.introTitle,
  introBody: HOME_COPY.introBody,
  introBodySecondary: HOME_COPY.introBodySecondary,
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
                alt="Engineer reviewing architectural drawings for a building project"
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
              More about RIVET COMPANY
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </FadeUp>
        </div>
      </Container>
    </Section>
  );
}
