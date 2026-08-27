import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { RivetImage } from '@/components/ui/rivet-image';
import { FadeUp } from '@/components/motion/reveal';
import { assets } from '@/lib/assets';
import { cn } from '@/lib/utils';

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

function MessageCard({
  person,
  photoRight = false,
}: {
  person: Message;
  photoRight?: boolean;
}) {
  return (
    <article className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.82fr)_1.18fr] lg:gap-12">
      <div className={cn('relative mx-auto w-full max-w-sm lg:mx-0', photoRight && 'lg:order-2')}>
        <div className="frame-offset relative aspect-[4/5] overflow-hidden rounded-[4px] bg-navy/5 shadow-[var(--shadow-luxury)]">
          {person.photo ? (
            <RivetImage
              src={person.photo}
              alt={`${person.name}, ${person.position} at River Company (RIVET)`}
              fill
              sizes="(max-width: 1024px) 80vw, 32vw"
              className="object-cover object-top"
            />
          ) : (
            <div className="grid h-full place-items-center bg-navy text-gold">
              <span className="headline-display text-[3.5rem] tracking-[0.08em]">
                {initials(person.name) || '—'}
              </span>
            </div>
          )}
        </div>
      </div>

      <blockquote className={cn('relative', photoRight ? 'lg:order-1 lg:text-right' : '')}>
        <span
          aria-hidden="true"
          className={cn(
            'headline-display pointer-events-none absolute -top-8 select-none text-[6.5rem] leading-none text-gold/25',
            photoRight ? 'right-0 lg:-right-3' : 'left-0 lg:-left-3',
          )}
        >
          “
        </span>
        <p
          className={cn(
            'relative text-[1.125rem] font-light leading-[1.85] tracking-wide text-ink sm:text-[1.1875rem]',
            photoRight && 'lg:ml-auto',
          )}
        >
          {person.message}
        </p>
        <footer className={cn('mt-8', photoRight && 'lg:ml-auto lg:flex lg:flex-col lg:items-end')}>
          <div
            className={cn(
              'h-px w-16 bg-gradient-to-r from-gold to-transparent',
              photoRight && 'lg:bg-gradient-to-l',
            )}
            aria-hidden="true"
          />
          <cite className="mt-4 block not-italic">
            <span className="headline-display block text-[1.5rem] text-navy">{person.name}</span>
            <span className="mt-1 block text-[0.75rem] font-medium uppercase tracking-[0.22em] text-gold">
              {person.position}
            </span>
          </cite>
        </footer>
      </blockquote>
    </article>
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
    <Section className="bg-pearl luxury-grain">
      <Container>
        <FadeUp>
          <div className="mb-16 max-w-2xl rivet-line lg:pl-8">
            <Eyebrow>Leadership</Eyebrow>
            <h2 className="headline-display mt-5 text-[2.25rem] sm:text-[2.75rem]">
              A word from management
            </h2>
            <p className="mt-5 font-light leading-[1.8] text-muted">
              Short notes from the people who set the standard — and stand behind every specification.
            </p>
          </div>
        </FadeUp>

        <div className="space-y-20 lg:space-y-24">
          <FadeUp>
            <MessageCard person={generalManager} />
          </FadeUp>
          <div className="gold-rule opacity-40" aria-hidden="true" />
          <FadeUp delay={0.1}>
            <MessageCard person={engineeringManager} photoRight />
          </FadeUp>
        </div>

        <FadeUp delay={0.15}>
          <div className="mt-16 text-center">
            <Link
              href="/company/team"
              className="gold-underline inline-flex items-center gap-3 text-[0.9375rem] font-medium tracking-wide text-navy"
            >
              Meet the wider team
              <ArrowRight size={16} className="text-gold" strokeWidth={1.5} />
            </Link>
          </div>
        </FadeUp>
      </Container>
    </Section>
  );
}
