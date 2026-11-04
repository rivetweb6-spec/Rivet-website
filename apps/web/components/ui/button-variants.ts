import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Corporate button system.
 * - primary: brand gold, the single main action per view
 * - secondary: navy, strong but secondary actions
 * - outline: bordered, for tertiary actions on light surfaces
 * - ghost: for use on dark imagery / navy bands
 */
export const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 rounded-[6px] font-semibold whitespace-nowrap transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-gold text-navy hover:bg-gold-soft',
        secondary:
          'bg-navy text-white hover:bg-navy-600 dark:bg-navy-400 dark:hover:bg-navy-600',
        ghost:
          'border border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10',
        outline:
          'border border-border bg-canvas text-navy hover:border-navy dark:bg-transparent dark:hover:border-gold',
      },
      size: {
        sm: 'h-10 px-4 text-[0.875rem]',
        md: 'h-11 px-5 text-[0.9375rem]',
        lg: 'h-12 px-6 text-[0.9375rem]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
