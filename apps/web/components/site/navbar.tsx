'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Menu, Search, X } from 'lucide-react';
import { Logo } from './logo';
import { CompanyMenu } from './company-menu';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useQuotationModal } from '@/components/quotation/quotation-modal-provider';
import { api, type SearchSuggestion } from '@/lib/api';
import { RivetImage } from '@/components/ui/rivet-image';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/services', label: 'Services' },
  { href: '/company', label: 'Company', menu: true },
  { href: '/news', label: 'News' },
  { href: '/careers', label: 'Careers' },
  { href: '/contact', label: 'Contact' },
];

/** Active when on the page or one of its children ("/" only matches exactly). */
function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { open } = useQuotationModal();
  const pathname = usePathname();
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const drawerRef = React.useRef<HTMLElement>(null);

  // Keep Tab inside the open drawer (plus the header button that closes it).
  useFocusTrap([menuButtonRef, drawerRef], menuOpen, {
    initialFocus: () => drawerRef.current?.querySelector<HTMLElement>('a[href], button'),
  });

  // Lock page scroll while the mobile drawer is open; always restore on close/unmount.
  React.useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  // Close drawer on Escape and when crossing into desktop layout.
  React.useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const mq = window.matchMedia('(min-width: 1024px)');
    const onBreakpoint = () => {
      if (mq.matches) setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    mq.addEventListener('change', onBreakpoint);
    return () => {
      window.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onBreakpoint);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-canvas">
        <div className="mx-auto flex h-[4.5rem] max-w-[1280px] items-center justify-between gap-6 px-5 sm:px-6 lg:px-10">
          <Link
            href="/"
            aria-label="RIVET COMPANY home"
            className="shrink-0 rounded-[4px] focus-visible:outline-offset-4"
          >
            <Logo className="h-8 sm:h-9" />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {links.map((l) =>
              'menu' in l && l.menu ? (
                <CompanyMenu key={l.href} variant="desktop" />
              ) : (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={isActivePath(pathname, l.href) ? 'page' : undefined}
                  className={cn(
                    'gold-underline text-[0.9375rem] font-medium transition-colors',
                    isActivePath(pathname, l.href)
                      ? 'text-navy'
                      : 'text-ink/75 hover:text-navy',
                  )}
                >
                  {l.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
              className="grid h-10 w-10 place-items-center rounded-[6px] text-ink/75 transition-colors hover:bg-bg hover:text-navy"
            >
              <Search size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <Button size="sm" className="ml-2 hidden sm:inline-flex" onClick={() => open()}>
              Request a Quotation
            </Button>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="grid h-10 w-10 place-items-center rounded-[6px] text-navy transition-colors hover:bg-bg lg:hidden"
            >
              {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.button
            key="mobile-nav-backdrop"
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-[4.5rem] z-40 bg-navy-deep/40 lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            ref={drawerRef}
            key="mobile-nav-drawer"
            id="mobile-nav"
            aria-label="Mobile"
            // Side drawer that slides in from the left, below the header.
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
            className="fixed bottom-0 left-0 top-[4.5rem] z-[45] w-[min(85vw,22rem)] overflow-y-auto border-r border-border bg-canvas shadow-[var(--shadow-lg)] lg:hidden"
          >
            <div className="px-5 pt-2 pb-8 sm:px-6">
              {links.map((l) =>
                'menu' in l && l.menu ? (
                  <CompanyMenu key={l.href} variant="mobile" onNavigate={() => setMenuOpen(false)} />
                ) : (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActivePath(pathname, l.href) ? 'page' : undefined}
                    className={cn(
                      'flex min-h-12 items-center border-b border-border text-[1rem] font-medium transition-colors',
                      isActivePath(pathname, l.href) ? 'text-navy' : 'text-ink hover:text-navy',
                    )}
                  >
                    {l.label}
                  </Link>
                ),
              )}
              <Button
                className="mt-6 w-full"
                size="lg"
                onClick={() => {
                  setMenuOpen(false);
                  open();
                }}
              >
                Request a Quotation
              </Button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const [query, setQuery] = React.useState('');
  const [products, setProducts] = React.useState<SearchSuggestion[]>([]);

  // Focus the search box on open, keep Tab inside, restore focus on close.
  useFocusTrap(dialogRef, open, { initialFocus: () => inputRef.current });
  const [categories, setCategories] = React.useState<{ name: string; slug: string }[]>([]);
  const [searched, setSearched] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Lock page scroll while search is open; always restore on close/unmount.
  React.useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) {
      window.addEventListener('keydown', onKey);
    } else {
      setQuery('');
      setProducts([]);
      setCategories([]);
      setSearched(false);
      setLoading(false);
      setError(null);
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Live suggestions while typing (debounced).
  React.useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setProducts([]);
      setCategories([]);
      setSearched(false);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const data = await api.products.suggest(q);
        if (cancelled) return;
        setProducts(data.products);
        setCategories(data.categories);
        setSearched(true);
      } catch {
        if (cancelled) return;
        setProducts([]);
        setCategories([]);
        setSearched(false);
        setError('Suggestions unavailable. Press Enter to search all products.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    go(`/products?search=${encodeURIComponent(q)}`);
  };

  const showNoResults = searched && !loading && !error && products.length === 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dialogRef}
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto px-4 pt-[12vh] pb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <div
            className="absolute inset-0 bg-navy-deep/50"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            className="relative z-10 w-full max-w-2xl rounded-[10px] border border-border bg-canvas p-5 shadow-[var(--shadow-bloom)] sm:p-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
          >
            <form onSubmit={submit}>
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <Search size={22} className="shrink-0 text-muted" strokeWidth={1.5} aria-hidden="true" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products by name, brand, category…"
                  aria-label="Search products"
                  autoComplete="off"
                  className="w-full bg-transparent text-[1.125rem] font-medium text-ink placeholder:text-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep sm:text-[2rem]"
                />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close search"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-[6px] text-muted transition-colors hover:bg-bg hover:text-navy"
                >
                  <X size={22} />
                </button>
              </div>
            </form>

            {loading && (
              <p className="mt-4 text-[0.875rem] text-muted" role="status">
                Searching…
              </p>
            )}

            {error && (
              <p className="mt-4 text-[0.875rem] text-error-ink" role="alert">
                {error}
              </p>
            )}

            {products.length > 0 && (
              <ul className="mt-4 overflow-hidden rounded-[8px] border border-border">
                {products.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => go(`/products/${p.slug}`)}
                      className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-bg"
                    >
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[6px] bg-bg">
                        {p.image && (
                          <RivetImage src={p.image} alt={p.name} fill sizes="44px" className="object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.9375rem] font-medium text-ink">{p.name}</p>
                        {p.category && (
                          <p className="text-[0.8125rem] text-muted">{p.category}</p>
                        )}
                      </div>
                      <ArrowUpRight size={16} className="shrink-0 text-muted" aria-hidden="true" />
                    </button>
                  </li>
                ))}
                <li className="border-t border-border">
                  <button
                    type="button"
                    onClick={() => submit()}
                    className="w-full px-4 py-3 text-left text-[0.875rem] font-semibold text-navy transition-colors hover:bg-bg"
                  >
                    See all results for “{query.trim()}”
                  </button>
                </li>
              </ul>
            )}

            {showNoResults && (
              <div className="mt-4 rounded-[8px] border border-border bg-bg px-5 py-6">
                <p className="text-[0.9375rem] text-ink">
                  No products found for “{query.trim()}”.
                </p>
                {categories.length > 0 ? (
                  <>
                    <p className="mt-3 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-muted">
                      Try these categories
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {categories.map((c) => (
                        <button
                          key={c.slug}
                          type="button"
                          onClick={() => go(`/products/${c.slug}`)}
                          className="rounded-[6px] border border-border bg-canvas px-3.5 py-1.5 text-[0.875rem] text-ink transition-colors hover:border-navy hover:text-navy"
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => go('/products')}
                    className="mt-3 text-[0.875rem] font-semibold text-navy hover:underline"
                  >
                    Browse all products
                  </button>
                )}
              </div>
            )}

            {!searched && !loading && !error && (
              <p className="mt-4 text-[0.875rem] text-muted">
                Start typing for suggestions, or press Enter to search. Esc to close.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
