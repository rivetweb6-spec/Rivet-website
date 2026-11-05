'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

/**
 * A horizontally scrollable <nav> that centres its active link
 * (`aria-current="page"`) on load and on route change, so the current tab
 * is never hidden off-screen on phones. Only scrolls the row itself —
 * never the page.
 */
export function ScrollNav(props: React.HTMLAttributes<HTMLElement>) {
  const ref = React.useRef<HTMLElement>(null);
  const pathname = usePathname();

  React.useEffect(() => {
    const nav = ref.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !active || nav.scrollWidth <= nav.clientWidth) return;
    const navRect = nav.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    nav.scrollLeft += activeRect.left - navRect.left - (navRect.width - activeRect.width) / 2;
  }, [pathname]);

  return <nav ref={ref} {...props} />;
}
