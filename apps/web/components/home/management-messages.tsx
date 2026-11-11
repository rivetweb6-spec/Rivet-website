import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container, Section, toneClass, type SectionTone } from '@/components/ui/container';
import { RivetImage } from '@/components/ui/rivet-image';
import { buildPersonAltText } from '@/lib/seo';
import { FadeUp } from '@/components/motion/reveal';
import { assets } from '@/lib/assets';
import { HOME_COPY } from '@/lib/data/home-copy';

export type ManagementMessagesContent = {
  gmName?: string | null;
  gmPosition?: string | null;
  gmPhoto?: string | null;
  gmMessage?: string | null;
  engName?: string | null;
  engPosition?: string | null;
  engPhoto?: string | null;
  engMessage?: string | null;
};

const defaults = {
  gmName: HOME_COPY.gmName,
  gmPosition: HOME_COPY.gmPosition,
  gmPhoto: assets.management.generalManager,
  gmMessage: HOME_COPY.gmMessage,
  engName: HOME_COPY.engName,
  engPosition: HOME_COPY.engPosition,
  engPhoto: assets.management.engineeringManager,
  engMessage: HOME_COPY.engMessage,
};

type Message = {
  name: string;
  position: string;
  photo: string;
  message: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function MessageCard({ person }: { person: Message }) {
  return (
    <figure className="flex h-full flex-col rounded-lg border border-border bg-canvas p-6 sm:flex-row sm:gap-6 md:p-7">
      <div className="relative mb-5 aspect-square w-24 shrink-0 overflow-hidden rounded-md bg-bg sm:mb-0 sm:w-28">
        {person.photo ? (
          <RivetImage
            src={person.photo}
            alt={buildPersonAltText(person.name, person.position)}
            fill
            sizes="112px"
            className="object-cover object-top"
          />
        ) : (
          <div className="grid h-full place-items-center bg-navy text-2xl font-bold text-gold">
            {initials(person.name) || '—'}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col">
        <blockquote className="text-md leading-relaxed text-ink">
          <p>&ldquo;{person.message}&rdquo;</p>
        </blockquote>
        <figcaption className="mt-auto pt-5">
          <span className="block font-semibold text-navy">{person.name}</span>
          {person.position !== person.name && (
            <span className="block text-xs text-muted">{person.position}</span>
          )}
        </figcaption>
      </div>
    </figure>
  );
}

export function ManagementMessages({
  content,
  tone = 'canvas',
}: {
  content?: ManagementMessagesContent | null;
  tone?: SectionTone;
}) {
  const generalManager: Message = {
    name: content?.gmName?.trim() || defaults.gmName,
    position: content?.gmPosition?.trim() || defaults.gmPosition,
    photo: content?.gmPhoto?.trim() || defaults.gmPhoto,
    message: content?.gmMessage?.trim() || defaults.gmMessage,
  };
  const engineeringManager: Message = {
    name: content?.engName?.trim() || defaults.engName,
    position: content?.engPosition?.trim() || defaults.engPosition,
    photo: content?.engPhoto?.trim() || defaults.engPhoto,
    message: content?.engMessage?.trim() || defaults.engMessage,
  };

  return (
    <Section className={toneClass(tone)}>
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-12">
          <div className="max-w-2xl">
            <h2 className="headline-display text-4xl sm:text-6xl">A message from our management</h2>
            <p className="mt-4 leading-relaxed text-muted">
              How RIVET COMPANY approaches every supply, installation and client relationship.
            </p>
          </div>
          <Link
            href="/company/team"
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy underline-offset-4 hover:underline"
          >
            Meet our team
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
          <FadeUp>
            <MessageCard person={generalManager} />
          </FadeUp>
          <FadeUp delay={0.06}>
            <MessageCard person={engineeringManager} />
          </FadeUp>
        </div>
      </Container>
    </Section>
  );
}
