'use client';

import { productInterests } from '@/lib/data/content';
import { cn } from '@/lib/utils';

export function joinProductInterests(selected: string[]) {
  return selected.join(', ');
}

export function parseProductInterests(value?: string | null): string[] {
  if (!value?.trim()) return [];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export function CategoryMultiSelect({
  id,
  selected,
  onChange,
  onBlur,
  error,
}: {
  id: string;
  selected: string[];
  onChange: (next: string[]) => void;
  onBlur?: () => void;
  error?: string;
}) {
  const toggle = (interest: string) => {
    if (selected.includes(interest)) {
      onChange(selected.filter((v) => v !== interest));
    } else {
      onChange([...selected, interest]);
    }
  };

  return (
    <div>
      <p id={`${id}-label`} className="mb-1.5 block text-[0.875rem] font-medium text-ink">
        Product Category <span className="text-gold">*</span>
      </p>
      <p className="mb-3 text-[0.75rem] text-muted">Select one or more categories.</p>
      <div
        role="group"
        aria-labelledby={`${id}-label`}
        aria-describedby={error ? `${id}-error` : undefined}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onBlur?.();
        }}
        className={cn(
          'grid grid-cols-2 gap-2 rounded-[12px] border p-3 sm:grid-cols-3',
          error ? 'border-error/60' : 'border-border',
        )}
      >
        {productInterests.map((interest) => {
          const checked = selected.includes(interest);
          const optionId = `${id}-${interest.replace(/\s+/g, '-').toLowerCase()}`;
          return (
            <label
              key={interest}
              htmlFor={optionId}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-[10px] px-2.5 py-2 text-[0.875rem] transition-colors',
                checked ? 'bg-navy/8 text-navy' : 'text-ink hover:bg-bg',
              )}
            >
              <input
                id={optionId}
                type="checkbox"
                checked={checked}
                onChange={() => toggle(interest)}
                className="h-4 w-4 shrink-0 rounded border-border accent-gold"
              />
              <span className="leading-snug">{interest}</span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[0.75rem] text-error">
          {error}
        </p>
      )}
    </div>
  );
}
