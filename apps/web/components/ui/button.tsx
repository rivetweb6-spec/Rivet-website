'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { buttonVariants, type ButtonVariantProps } from './button-variants';

type Ripple = { id: number; x: number; y: number };

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {}

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
