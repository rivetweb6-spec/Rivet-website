import { cn } from '@/lib/utils';

/**
 * Loading placeholder block. Pulses gently; the global reduced-motion rule
 * in globals.css stops the animation for users who ask for less motion.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-champagne', className)} />;
}
