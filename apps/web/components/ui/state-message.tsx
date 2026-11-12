import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * One layout for every empty and "nothing found" state on the public site:
 * icon, a plain statement of what happened, what to do next, and actions.
 * Copy should say what's missing and offer the next step — never apologise.
 */
export function StateMessage({
  icon: Icon,
  title,
  children,
  actions,
  as: Heading = 'h2',
  className,
}: {
  icon: LucideIcon;
  title: ReactNode;
  /** Explanation and next step. */
  children?: ReactNode;
  /** Buttons / links, laid out in a wrapping row. */
  actions?: ReactNode;
  /** Heading level that fits the surrounding outline. */
  as?: 'h2' | 'h3';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface px-6 py-8 sm:px-10 sm:py-10',
        className,
      )}
    >
      <div className="max-w-xl">
        <span className="grid h-11 w-11 place-items-center rounded-md bg-canvas text-navy ring-1 ring-border">
          <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <Heading className="mt-5 text-xl font-semibold leading-snug">{title}</Heading>
        {children && <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div>}
        {actions && <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
