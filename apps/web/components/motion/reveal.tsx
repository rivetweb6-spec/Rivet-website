import * as React from 'react';

/*
 * Formerly scroll reveals: every section and card slid 12px into place as it
 * scrolled into view. Motion on everything draws attention to nothing, so the
 * site now has one deliberate entrance (the homepage department directory,
 * see `.directory-in` in globals.css) and these components render their
 * content statically.
 *
 * The API is unchanged (FadeUp / Stagger / StaggerItem with the same props),
 * so existing pages keep working, and they no longer need client-side
 * JavaScript. To bring motion back for one place, wrap it in a framer-motion
 * element directly rather than reviving these site-wide.
 */

export function FadeUp({
  children,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  /** Kept for API compatibility; no longer used. */
  delay?: number;
  className?: string;
  as?: 'div' | 'span' | 'li';
}) {
  return <Tag className={className}>{children}</Tag>;
}

export function Stagger({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
