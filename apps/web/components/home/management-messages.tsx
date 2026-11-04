import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { RivetImage } from '@/components/ui/rivet-image';
import { FadeUp } from '@/components/motion/reveal';
import { assets } from '@/lib/assets';

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
  gmName: 'General Manager',
  gmPosition: 'General Manager',
  gmPhoto: assets.management.generalManager,
  gmMessage:
    'Every project we take on is a commitment — to specification, to craft, and to the people who will live and work in the spaces we help build.',
  engName: 'Engineering Manager',
  engPosition: 'Engineering Manager',
  engPhoto: assets.management.engineeringManager,
  engMessage:
    'Engineering is the quiet work behind a confident installation. We specify with care so that what arrives on site performs as promised.',
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
    <figure className="flex h-full flex-col rounded-[8px] border border-border bg-canvas p-6 sm:flex-row sm:gap-6 md:p-7">
      <div className="relative mb-5 aspect-square w-24 shrink-0 overflow-hidden rounded-[6px] bg-bg sm:mb-0 sm:w-28">
        {person.photo ? (
          <RivetImage
            src={person.photo}
            alt={`${person.name}, ${person.position} at River Company (RIVET)`}
            fill
            sizes="112px"
            className="object-cover object-top"
          />
        ) : (
          <div className="grid h-full place-items-center bg-navy text-[1.5rem] font-bold text-gold">
            {initials(person.name) || '—'}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col">
        <blockquote className="text-[1.0625rem] leading-relaxed text-ink">
          <p>&ldquo;{person.message}&rdquo;</p>
        </blockquote>
        <figcaption className="mt-auto pt-5">
          <span className="block font-semibold text-navy">{person.name}</span>
          {person.position !== person.name && (
            <span className="block text-[0.875rem] text-muted">{person.position}</span>
          )}
        </figcaption>
      </div>
    </figure>
  );
}

export function ManagementMessages({ content }: { content?: ManagementMessagesContent | null }) {
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
    <Section>
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-12">
          <div className="max-w-2xl">
            <Eyebrow>Leadership</Eyebrow>
            <h2 className="headline-display mt-3 text-[2rem] sm:text-[2.5rem]">A word from management</h2>
            <p className="mt-4 leading-relaxed text-muted">
              Short notes from the people who set the standard — and stand behind every specification.
            </p>
          </div>
          <Link
            href="/company/team"
            className="inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-navy underline-offset-4 hover:underline"
          >
            Meet the wider team
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
