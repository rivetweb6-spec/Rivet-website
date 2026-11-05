import type { ReactNode } from 'react';
import { Container, Eyebrow } from '@/components/ui/container';

/**
 * Page header for interior pages: a light, structured band below the fixed
 * site header — kicker, title and summary, with optional breadcrumbs (`lead`).
 */
export function PageHero({
  eyebrow,
  title,
  description,
  lead,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  /** Optional content above the eyebrow (e.g. breadcrumbs). */
  lead?: ReactNode;
}) {
  return (
    <section className="border-b border-border bg-bg pt-28 pb-12 md:pt-32 md:pb-16">
      <Container>
        {lead && <div className="mb-6">{lead}</div>}
        <div className="max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="headline-display mt-3 text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-muted md:text-[1.125rem]">
              {description}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
