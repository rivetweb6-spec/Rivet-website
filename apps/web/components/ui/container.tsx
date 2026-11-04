import * as React from 'react';
import { cn } from '@/lib/utils';

/** Page content width: 1280px max with responsive side gutters. */
export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10', className)}
      {...props}
    />
  );
}

/**
 * Section kicker above a heading. Steel navy on light surfaces (≥ 6.9:1),
 * gold on dark. Pass `text-gold` explicitly when placed on a navy band.
 */
export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('eyebrow text-navy-400 dark:text-gold', className)} {...props} />;
}

/** Vertical rhythm for page sections: 64px mobile, 96px desktop. */
export function Section({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn('py-16 md:py-24', className)} {...props}>
      {children}
    </section>
  );
}
