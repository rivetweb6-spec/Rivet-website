'use client';

import * as React from 'react';
import * as Sentry from '@sentry/nextjs';
import './globals.css';

/**
 * Last-resort boundary when the root layout itself fails. It replaces the
 * whole document, so it renders its own <html>/<body> and avoids components
 * that depend on providers.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-bg">
        <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-5 py-16">
          <p className="font-display text-xl font-bold tracking-[0.12em] text-navy">RIVET</p>
          <h1 className="headline-display mt-8 text-5xl">The site didn&rsquo;t load</h1>
          <p className="mt-4 text-md leading-relaxed text-ink/85">
            Something went wrong on our side. Try again in a moment.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex h-12 items-center rounded-md bg-gold px-6 text-sm font-semibold text-navy hover:bg-gold-soft"
            >
              Try again
            </button>
            {/* Plain anchor: a full reload is the most reliable recovery here. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="inline-flex h-12 items-center rounded-md border border-border bg-canvas px-6 text-sm font-semibold text-navy hover:border-navy"
            >
              Go to the homepage
            </a>
          </div>
          {error.digest && (
            <p className="mt-8 text-2xs text-muted">
              Reference for our team: <span className="font-medium text-ink">{error.digest}</span>
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
