import Image from 'next/image';
import { assets } from '@/lib/assets';
import { cn } from '@/lib/utils';

/**
 * Official RIVET logo — replace `/public/logo.png` (and `/public/logo-light.png`
 * for dark surfaces) to update site-wide. Original client file is kept at
 * `/public/logo-original.png`.
 *
 * - `light`: always the light logo (for navy bands, the footer)
 * - default: follows the theme — navy logo in light mode, light logo in dark
 *   mode. Both are rendered and swapped with CSS, so there is no flash or
 *   hydration mismatch.
 */
export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  const classes = cn('h-8 w-auto sm:h-9 md:h-10', className);
  const common = { alt: 'RIVET — River Company', width: 525, height: 132, priority: true, unoptimized: true } as const;

  if (light) return <Image src={assets.logo.light} className={classes} {...common} />;

  return (
    <>
      <Image src={assets.logo.primary} className={cn(classes, 'dark:hidden')} {...common} />
      <Image
        src={assets.logo.light}
        className={cn(classes, 'hidden dark:block')}
        {...common}
        alt=""
        aria-hidden="true"
      />
    </>
  );
}
