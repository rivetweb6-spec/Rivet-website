'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Search, X } from 'lucide-react';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useDemoModal } from '@/components/demo/demo-modal-provider';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/services', label: 'Services' },
  { href: '/company', label: 'Company' },
  { href: '/news', label: 'News' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { open } = useDemoModal();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solid = scrolled || menuOpen;

  return (
    <>
      <motion.header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-700',
          solid
            ? 'border-b border-gold/20 bg-navy-deep/90 shadow-[var(--shadow-md)] backdrop-blur-2xl'
            : 'bg-transparent',
        )}
      >
        <div className="mx-auto flex h-[4.5rem] max-w-[1280px] items-center justify-between px-6 md:px-12">
          <Link href="/" aria-label="RIVET home">
            <Logo light />
          </Link>

          <nav className="hidden items-center gap-10 lg:flex" aria-label="Primary">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="gold-underline text-[0.8125rem] font-medium tracking-[0.06em] text-white/75 transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle light />
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="grid h-10 w-10 place-items-center rounded-full text-white/70 transition-all duration-300 hover:bg-white/8 hover:text-gold"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
            <Button
              variant="primary"
              size="sm"
              className="hidden tracking-wide sm:inline-flex"
              onClick={open}
            >
              Request Demo
            </Button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="grid h-10 w-10 place-items-center rounded-full text-white transition-colors hover:bg-white/8 lg:hidden"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              id="mobile-nav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-gold/15 bg-navy-deep lg:hidden"
              aria-label="Mobile"
            >
              <div className="flex flex-col px-6 py-6">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="border-b border-white/5 py-4 text-[0.9375rem] tracking-wide text-white/80 transition-colors hover:text-gold"
                  >
                    {l.label}
                  </Link>
                ))}
                <Button variant="primary" className="mt-6" onClick={open}>
                  Request Demo
                </Button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) {
      window.addEventListener('keydown', onKey);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQuery('');
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    onClose();
    router.push(`/products?search=${encodeURIComponent(q)}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[18vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <div
            className="absolute inset-0 bg-navy-deep/80 backdrop-blur-2xl"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.form
            onSubmit={submit}
            className="relative z-10 w-full max-w-2xl px-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
          >
            <div className="flex items-center gap-4 border-b border-gold/30 pb-5">
              <Search size={22} className="text-gold" strokeWidth={1.5} aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, services, news…"
                aria-label="Search products, services, and news"
                className="headline-display w-full bg-transparent text-[2rem] text-white placeholder:text-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="text-white/60 transition-colors hover:text-gold"
              >
                <X size={22} />
              </button>
            </div>
            <p className="mt-5 text-[0.8125rem] tracking-wide text-white/50">
              Press Enter to search the product catalog. Esc to close.
            </p>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
