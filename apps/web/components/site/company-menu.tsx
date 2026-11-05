'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { companyNavLinks, isCompanyPath } from '@/lib/company-nav';
import { cn } from '@/lib/utils';

export function CompanyMenu({
  onNavigate,
  variant,
}: {
  onNavigate?: () => void;
  variant: 'desktop' | 'mobile';
}) {
  if (variant === 'mobile') {
    return <MobileCompanyMenu onNavigate={onNavigate} />;
  }
  return <DesktopCompanyMenu onNavigate={onNavigate} />;
}

function MobileCompanyMenu({ onNavigate }: { onNavigate?: () => void }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="company-mobile-submenu"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-12 w-full items-center justify-between border-b border-border text-[1rem] font-medium text-ink transition-colors hover:text-navy"
      >
        Company
        <ChevronDown
          size={16}
          className={cn('transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div id="company-mobile-submenu" className="border-b border-border bg-bg/60 py-1 pl-4">
          {companyNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className="flex min-h-11 items-center py-2.5 text-[0.9375rem] text-muted transition-colors hover:text-navy"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function DesktopCompanyMenu({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const active = isCompanyPath(pathname);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="company-desktop-menu"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'gold-underline inline-flex items-center gap-1.5 whitespace-nowrap text-[0.875rem] font-medium transition-colors xl:text-[0.9375rem]',
          active ? 'text-navy' : 'text-ink/75 hover:text-navy',
        )}
      >
        Company
        <ChevronDown
          size={14}
          className={cn('transition-transform duration-200', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id="company-desktop-menu"
            role="menu"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-1/2 z-50 w-72 -translate-x-1/2 pt-4"
          >
            <div className="overflow-hidden rounded-[8px] border border-border bg-canvas py-2 shadow-[var(--shadow-lg)]">
              {companyNavLinks.map((link) => {
                const isActive =
                  'exact' in link && link.exact
                    ? pathname === link.href
                    : pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    role="menuitem"
                    onClick={() => {
                      setOpen(false);
                      onNavigate?.();
                    }}
                    className={cn(
                      'block px-5 py-2.5 text-[0.9375rem] transition-colors',
                      isActive ? 'bg-bg font-medium text-navy' : 'text-ink hover:bg-bg hover:text-navy',
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
