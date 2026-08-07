import Image from 'next/image';
import { assets } from '@/lib/assets';
import { cn } from '@/lib/utils';

/**
 * Official RIVET logo — replace `/public/logo.png` (and `/public/logo-light.png`
 * for dark surfaces) to update site-wide. Original client file is kept at
 * `/public/logo-original.png`.
 */
export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Image
      src={light ? assets.logo.light : assets.logo.primary}
      alt="RIVET — River Company"
      width={525}
      height={132}
      priority
      unoptimized
      className={cn('h-8 w-auto sm:h-9 md:h-11', className)}
    />
  );
}
