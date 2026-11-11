import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Neutral stand-in for a product or category that has no photo yet. Used
 * instead of a borrowed stock image, which would misrepresent the product.
 * Fills its (relatively positioned) parent like an `<Image fill>`.
 */
export function ImagePlaceholder({
  label,
  className,
  compact = false,
}: {
  /** Accessible description, e.g. "Photo of Granite slab not available". */
  label?: string;
  className?: string;
  /** Icon only — for thumbnails. */
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'absolute inset-0 flex flex-col items-center justify-center gap-2 bg-bg text-muted',
        className,
      )}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      <ImageOff size={compact ? 18 : 28} strokeWidth={1.5} aria-hidden="true" />
      {!compact && <span className="text-sm">Photo coming soon</span>}
    </div>
  );
}
