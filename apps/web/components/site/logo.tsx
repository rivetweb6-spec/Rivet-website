import { cn } from '@/lib/utils';

/**
 * Temporary wordmark. Swap for the official RIVET SVG logo when supplied —
 * keep the same width/height footprint so layout is unaffected.
 */
export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span
      className={cn(
        'font-display text-[1.625rem] font-medium tracking-[0.22em]',
        light ? 'text-white' : 'text-navy',
        className,
      )}
    >
      RIVET
      <span className="text-gold-shimmer">.</span>
    </span>
  );
}
