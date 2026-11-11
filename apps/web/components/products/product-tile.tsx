import Link from 'next/link';
import { RivetImage } from '@/components/ui/rivet-image';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { cn } from '@/lib/utils';

export type ProductTileProps = {
  href: string;
  name: string;
  description?: string | null;
  image?: string | null;
  imageAlt: string;
  /** Shown above the name in mixed lists; omit on a category's own page. */
  category?: string | null;
  /** `wide` lays image and text side by side (used when a list has one item). */
  layout?: 'card' | 'wide';
  headingLevel?: 'h2' | 'h3';
};

/**
 * The one product card. The whole card is the link; hover and keyboard focus
 * both tint the border and underline the name — no lift, no image zoom, no
 * "View product" pseudo-button inside a link.
 */
export function ProductTile({
  href,
  name,
  description,
  image,
  imageAlt,
  category,
  layout = 'card',
  headingLevel: Heading = 'h3',
}: ProductTileProps) {
  const wide = layout === 'wide';
  return (
    <Link
      href={href}
      className={cn(
        'card-frame group flex h-full overflow-hidden rounded-lg bg-canvas',
        wide ? 'flex-col sm:flex-row' : 'flex-col',
      )}
    >
      <div
        className={cn(
          'relative aspect-[4/3] shrink-0 overflow-hidden bg-bg',
          wide && 'sm:w-2/5',
        )}
      >
        {image ? (
          <RivetImage
            src={image}
            alt={imageAlt}
            fill
            sizes={wide ? '(max-width: 640px) 100vw, 40vw' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
            className="object-cover"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>
      <div className={cn('flex flex-1 flex-col p-5 md:p-6', wide && 'sm:justify-center sm:p-8')}>
        {category && <p className="text-2xs font-medium text-muted">{category}</p>}
        <Heading
          className={cn(
            'text-xl leading-snug group-hover:underline group-hover:underline-offset-4 group-focus-visible:underline group-focus-visible:underline-offset-4',
            category && 'mt-1',
          )}
        >
          {name}
        </Heading>
        {description && (
          <p className={cn('mt-2 text-sm leading-relaxed text-muted', wide ? 'line-clamp-4' : 'line-clamp-2')}>
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}
