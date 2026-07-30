'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/providers/theme-provider';
import { cn } from '@/lib/utils';

export function ThemeToggle({
  className,
  light = false,
}: {
  className?: string;
  /** Use light icon styling (for navy backgrounds). */
  light?: boolean;
}) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'grid h-10 w-10 place-items-center rounded-full transition-all duration-300',
        light
          ? 'text-white/70 hover:bg-white/8 hover:text-gold'
          : 'text-ink hover:bg-bg hover:text-gold',
        className,
      )}
    >
      {resolvedTheme === 'dark' ? (
        <Sun size={18} strokeWidth={1.5} />
      ) : (
        <Moon size={18} strokeWidth={1.5} />
      )}
    </button>
  );
}
