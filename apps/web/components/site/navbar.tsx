'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Menu, Search, X } from 'lucide-react';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useQuotationModal } from '@/components/quotation/quotation-modal-provider';
import { api, type SearchSuggestion } from '@/lib/api';
import { RivetImage } from '@/components/ui/rivet-image';

const links = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/services', label: 'Services' },
  { href: '/company', label: 'Company' },
  { href: '/news', label: 'News' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { open } = useQuotationModal();

  return (
    <>
      <motion.header
        className={`fixed inset-x-0 top-0 z-50 border-b border-gold/15${
          menuOpen ? ' overflow-hidden' : ''
        }`}
      >
        {/* Opaque brand fill — exact #001A30 */}
        <div className="absolute inset-0" style={{ backgroundColor: '#001A30' }} aria-hidden="true" />
        {/* 80px grid aligned with hero */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            backgroundPosition: '0 0',
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto flex h-[4.5rem] max-w-[1280px] items-center justify-between px-6 md:px-12">
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
              onClick={() => open()}
            >
              Request a Quotation
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
              className="relative overflow-hidden border-t border-gold/15 lg:hidden"
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
                <Button variant="primary" className="mt-6" onClick={() => open()}>
                  Request a Quotation
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
  const [products, setProducts] = React.useState<SearchSuggestion[]>([]);
  const [categories, setCategories] = React.useState<{ name: string; slug: string }[]>([]);
  const [searched, setSearched] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) {
      window.addEventListener('keydown', onKey);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQuery('');
      setProducts([]);
      setCategories([]);
      setSearched(false);
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
      return;
    }
    setLoading(true);
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const data = await api.products.suggest(q);
        if (cancelled) return;
        setProducts(data.products);
        setCategories(data.categories);
        setSearched(true);
      } catch {
        /* suggestions are best-effort */
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

  const showNoResults = searched && !loading && products.length === 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto pt-[14vh] pb-10"
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
          <motion.div
            className="relative z-10 w-full max-w-2xl px-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
          >
            <form onSubmit={submit}>
              <div className="flex items-center gap-4 border-b border-gold/30 pb-5">
                <Search size={22} className="text-gold" strokeWidth={1.5} aria-hidden="true" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products by name, brand, category…"
                  aria-label="Search products"
                  autoComplete="off"
                  className="headline-display w-full bg-transparent text-[1.5rem] text-white placeholder:text-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep sm:text-[2rem]"
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
            </form>

            {products.length > 0 && (
              <ul className="mt-4 overflow-hidden rounded-[16px] bg-navy-deep/90 ring-1 ring-white/10">
                {products.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => go(`/products/${p.slug}`)}
                      className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-white/5"
                    >
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[8px] bg-white/5">
                        {p.image && (
                          <RivetImage src={p.image} alt={p.name} fill sizes="44px" className="object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.9375rem] text-white">{p.name}</p>
                        {p.category && (
                          <p className="text-[0.75rem] tracking-wide text-white/45">{p.category}</p>
                        )}
                      </div>
                      <ArrowUpRight size={16} className="shrink-0 text-gold/70" aria-hidden="true" />
                    </button>
                  </li>
                ))}
                <li className="border-t border-white/8">
                  <button
                    type="button"
                    onClick={() => submit()}
                    className="w-full px-4 py-3 text-left text-[0.8125rem] tracking-wide text-gold transition-colors hover:bg-white/5"
                  >
                    See all results for “{query.trim()}”
                  </button>
                </li>
              </ul>
            )}

            {showNoResults && (
              <div className="mt-4 rounded-[16px] bg-navy-deep/90 px-5 py-6 ring-1 ring-white/10">
                <p className="text-[0.9375rem] text-white/80">
                  No products found for “{query.trim()}”.
                </p>
                {categories.length > 0 ? (
                  <>
                    <p className="mt-3 text-[0.75rem] uppercase tracking-[0.18em] text-white/40">
                      Try these categories
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {categories.map((c) => (
                        <button
                          key={c.slug}
                          type="button"
                          onClick={() => go(`/products/${c.slug}`)}
                          className="rounded-full border border-white/15 px-3.5 py-1.5 text-[0.8125rem] text-white/75 transition-colors hover:border-gold hover:text-gold"
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
                    className="mt-3 text-[0.8125rem] text-gold hover:underline"
                  >
                    Browse all products
                  </button>
                )}
              </div>
            )}

            {!searched && (
              <p className="mt-5 text-[0.8125rem] tracking-wide text-white/50">
                Start typing for suggestions, or press Enter to search. Esc to close.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
