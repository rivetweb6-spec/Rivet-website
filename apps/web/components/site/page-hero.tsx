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
          <h1 className="headline-display mt-3 text-5xl sm:text-7xl lg:text-8xl">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-2xl text-md leading-relaxed text-muted md:text-lg">
              {description}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
