import * as React from 'react';
import { cn } from '@/lib/utils';

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mx-auto w-full max-w-[1280px] px-6 md:px-12', className)} {...props} />;
}

export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  /* Default navy on light surfaces (AA). Pass `text-gold` when on navy. */
  return <span className={cn('eyebrow text-navy', className)} {...props} />;
}

export function Section({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn('py-28 md:py-36', className)} {...props}>
      {children}
    </section>
  );
}
