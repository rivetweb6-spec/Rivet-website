import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-[4px] font-medium tracking-wide transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-gold text-navy shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-luxury)] hover:brightness-110',
        secondary:
          'bg-navy text-white shadow-[var(--shadow-sm)] hover:bg-navy-600 hover:shadow-[var(--shadow-md)]',
        ghost:
          'border border-white/25 bg-white/5 text-white backdrop-blur-sm hover:border-gold/60 hover:text-gold',
        outline:
          'border border-navy/15 text-navy hover:border-gold hover:text-gold',
      },
      size: {
        sm: 'h-10 px-5 text-[0.8125rem]',
        md: 'h-12 px-7 text-[0.9375rem]',
        lg: 'h-14 px-9 text-[0.9375rem] uppercase tracking-[0.08em]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
