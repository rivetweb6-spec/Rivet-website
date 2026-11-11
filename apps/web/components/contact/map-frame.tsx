'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Wrapper for the embedded office map that shows the site focus outline
 * while the map has focus. CSS can't do this: when focus moves into an
 * iframe, Chromium matches neither :focus-visible on the iframe nor
 * :focus-within on its parent. The parent window does lose focus, though,
 * with the iframe as the active element — that is what we listen for.
 */
export function MapFrame({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    const onBlur = () => {
      // The iframe becomes the active element only after the blur event.
      window.setTimeout(() => {
        const active = document.activeElement;
        setFocused(Boolean(active && active.tagName === 'IFRAME' && ref.current?.contains(active)));
      }, 0);
    };
    const onFocus = () => setFocused(false);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(className, focused && 'outline-2 outline-offset-2 outline-solid')}
      data-focused={focused || undefined}
    >
      {children}
    </div>
  );
}
