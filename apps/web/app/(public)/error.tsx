'use client';

import * as React from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import { RotateCw } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';

/**
 * Error boundary for every public page. The site header and footer stay in
 * place (the layout tolerates API failures), so visitors can keep navigating.
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    Sentry.captureException(error);
    // Move focus to the message so keyboard and screen-reader users hear it.
    headingRef.current?.focus();
  }, [error]);

  return (
    <section className="flex min-h-[70vh] items-center bg-bg pt-28 pb-16" aria-labelledby="error-title">
      <Container>
        <div className="max-w-xl">
          <h1
            id="error-title"
            ref={headingRef}
            tabIndex={-1}
            className="headline-display text-5xl outline-none sm:text-7xl"
          >
            This page didn&rsquo;t load
          </h1>
          <p className="mt-4 text-md leading-relaxed text-ink/85">
            Our product catalog didn&rsquo;t respond. This is usually temporary, so try again in a
            moment. If it keeps happening,{' '}
            <Link href="/contact" className="font-semibold text-navy underline underline-offset-4 hover:no-underline">
              contact our team
            </Link>
            .
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => reset()}>
              <RotateCw size={18} aria-hidden="true" />
              Try again
            </Button>
            <Link href="/" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              Go to the homepage
            </Link>
          </div>
          {error.digest && (
            <p className="mt-8 text-2xs text-muted">
              Reference for our team: <span className="font-medium text-ink">{error.digest}</span>
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
