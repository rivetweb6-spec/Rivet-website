'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
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

type Ripple = { id: number; x: number; y: number };

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, onClick, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<Ripple[]>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const id = Date.now();
      setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
      setTimeout(() => setRipples((r) => r.filter((item) => item.id !== id)), 650);
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        onClick={handleClick}
        {...props}
      >
        {ripples.map((r) => (
          <span
            key={r.id}
            className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 animate-[ripple_0.65s_ease-out] rounded-full bg-current opacity-20"
            style={{ left: r.x, top: r.y }}
          />
        ))}
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      </button>
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
