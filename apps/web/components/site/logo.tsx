import Image from 'next/image';
import { assets } from '@/lib/assets';
import { cn } from '@/lib/utils';

const ALT = 'RIVET COMPANY';
const SIZE = { width: 525, height: 132 } as const;

/**
 * Official RIVET logo — replace `/public/logo.png` (and `/public/logo-light.png`
 * for dark surfaces) to update site-wide. Original client file is kept at
 * `/public/logo-original.png`.
 *
 * - `light`: always the light logo (for navy bands, the footer)
 * - default: follows the theme — navy logo in light mode, light logo in dark
 *   mode. Both are rendered and swapped with CSS, so there is no flash or
 *   hydration mismatch; the dark copy is hidden from assistive tech.
 */
export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  const classes = cn('h-8 w-auto sm:h-9 md:h-10', className);

  if (light) {
    return <Image src={assets.logo.light} alt={ALT} {...SIZE} priority unoptimized className={classes} />;
  }

  return (
    <>
      <Image
        src={assets.logo.primary}
        alt={ALT}
        {...SIZE}
        priority
        unoptimized
        className={cn(classes, 'dark:hidden')}
      />
      <Image
        src={assets.logo.light}
        alt=""
        aria-hidden="true"
        {...SIZE}
        priority
        unoptimized
        className={cn(classes, 'hidden dark:block')}
      />
    </>
  );
}
