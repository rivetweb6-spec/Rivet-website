import { cn } from '@/lib/utils';

/**
 * Phone/tablet drawer row. The current page gets a gold bar and bold text
 * (colour alone was nearly indistinguishable: navy vs. near-navy ink).
 */
export function mobileNavItemClass(active: boolean) {
  return cn(
    'relative flex min-h-12 w-full items-center border-b border-border pl-3 text-base transition-colors',
    active
      ? 'font-semibold text-navy before:absolute before:top-1/2 before:left-0 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-r before:bg-gold'
      : 'font-medium text-ink hover:text-navy',
  );
}
