import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Container, Eyebrow, Section, toneClass, type SectionTone } from '@/components/ui/container';
import { advantages } from '@/lib/data/content';
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

/**
 * About RIVET: image beside kicker, title and two paragraphs (CMS-driven),
 * followed by the reasons clients choose RIVET (formerly a separate
 * "Why choose RIVET" section — merged so the story and the proof sit together).
 */
export function Intro({
  content,
  tone = 'canvas',
}: {
  content?: IntroContent | null;
  /** Background, assigned by the page so sections alternate. */
  tone?: SectionTone;
}) {
  const eyebrow = content?.introEyebrow?.trim() || defaults.introEyebrow;
  const title = content?.introTitle?.trim() || defaults.introTitle;
  const body = content?.introBody?.trim() || defaults.introBody;
  const bodySecondary = content?.introBodySecondary?.trim() || defaults.introBodySecondary;
  const image = content?.introImage?.trim() || defaults.introImage;

  return (
    <Section id="intro" className={toneClass(tone)}>
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <FadeUp>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-bg">
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
            <h2 className="headline-display mt-3 text-4xl sm:text-6xl">{title}</h2>
            <p className="mt-6 text-md leading-relaxed text-ink/85">{body}</p>
            <p className="mt-4 leading-relaxed text-muted">{bodySecondary}</p>
            <Link
              href="/company"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-navy underline-offset-4 hover:underline"
            >
              More about RIVET COMPANY
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </FadeUp>
        </div>

        <div className="mt-14 grid gap-8 border-t border-border pt-10 md:mt-16 md:pt-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)] lg:gap-16">
          <div>
            <h3 className="text-2xl sm:text-3xl">A dependable partner from specification to handover</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Developers, contractors and architects get one team that takes responsibility for the
              product, the installation and the service that follows.
            </p>
          </div>
          <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {advantages.map((a) => {
              const Icon = (Icons[a.icon as keyof typeof Icons] ?? Icons.Check) as Icons.LucideIcon;
              return (
                <li key={a.title} className="flex gap-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-bg text-navy">
                    <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div>
                    <h4 className="text-base font-semibold text-ink">{a.title}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{a.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
