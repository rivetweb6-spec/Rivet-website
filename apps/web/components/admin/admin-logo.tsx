import Image from 'next/image';
import { assets } from '@/lib/assets';
import { cn } from '@/lib/utils';

/**
 * Official RIVET wordmark for admin chrome (login + sidebar).
 * Navy+gold on light surfaces; white+gold on the navy sidebar.
 */
export function AdminLogo({
  className,
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <Image
      src={light ? assets.logo.adminLight : assets.logo.admin}
      alt="RIVET"
      width={797}
      height={179}
      priority
      unoptimized
      className={cn('h-8 w-auto', className)}
    />
  );
}
