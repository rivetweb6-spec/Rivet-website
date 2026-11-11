'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/providers/theme-provider';
import { cn } from '@/lib/utils';

/**
 * Light/dark switch. The choice is persisted (see ThemeProvider); light is
 * the default. Shows the icon of the mode it will switch *to*.
 */
export function ThemeToggle({
  className,
  light = false,
}: {
  className?: string;
  /** Use light icon styling (for navy backgrounds). */
  light?: boolean;
}) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        'grid h-10 w-10 place-items-center rounded-md transition-colors duration-200',
        light
          ? 'text-white/75 hover:bg-white/10 hover:text-white'
          : 'text-ink/75 hover:bg-bg hover:text-navy',
        className,
      )}
    >
      {isDark ? (
        <Sun size={18} strokeWidth={1.75} aria-hidden="true" />
      ) : (
        <Moon size={18} strokeWidth={1.75} aria-hidden="true" />
      )}
    </button>
  );
}
