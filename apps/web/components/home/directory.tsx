import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { categories as fallbackCategories } from '@/lib/data/content';

export type DirectoryEntry = {
  slug: string;
  name: string;
  /** Published products in the department and all its ranges (undefined when unknown). */
  productCount?: number;
  /** Sub-categories ("ranges") directly under the department. */
  rangeCount?: number;
};

function meta({ productCount, rangeCount }: DirectoryEntry): string | null {
  const parts: string[] = [];
  if (rangeCount) parts.push(`${rangeCount} range${rangeCount === 1 ? '' : 's'}`);
  if (productCount !== undefined) {
    parts.push(
      productCount > 0
        ? `${productCount} product${productCount === 1 ? '' : 's'} listed`
        : 'Supplied on request',
    );
  }
  return parts.length ? parts.join(', ') : null;
}

/**
 * Department directory — the homepage's main way in, set like a building's
 * lobby directory: every department on one board, each a single tap away.
 * It overlaps the hero's lower edge and is the page's one entrance motion.
 */
export function Directory({ items }: { items?: DirectoryEntry[] }) {
  // `undefined` = API unreachable (names only). `[]` = no departments — hide.
  const list =
    items === undefined ? fallbackCategories.map((c) => ({ slug: c.slug, name: c.name })) : items;
  if (list.length === 0) return null;

  return (
    <section aria-labelledby="directory-title" className="relative z-10 bg-canvas pb-16 md:pb-20">
      <Container>
        <div className="directory-in -mt-10 overflow-hidden rounded-lg border border-border bg-canvas shadow-[var(--shadow-lg)] md:-mt-16">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-border px-5 py-5 sm:px-8 sm:py-6">
            <h2 id="directory-title" className="text-2xl sm:text-3xl">
              Find products by department
            </h2>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy underline-offset-4 hover:underline"
            >
              Browse all products
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <ul className="grid sm:grid-cols-2">
            {list.map((d) => {
              const detail = meta(d);
              return (
                <li
                  key={d.slug}
                  className="border-t border-border first:border-t-0 sm:odd:border-r sm:[&:nth-child(2)]:border-t-0"
                >
                  <Link
                    href={`/products/${d.slug}`}
                    className="group flex min-h-[4.5rem] items-center gap-4 px-5 py-4 transition-colors hover:bg-bg focus-visible:bg-bg focus-visible:outline-offset-[-2px] sm:px-8"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-lg font-semibold text-navy group-hover:underline group-hover:underline-offset-4">
                        {d.name}
                      </span>
                      {detail && <span className="mt-0.5 block text-2xs text-muted">{detail}</span>}
                    </span>
                    <ArrowRight
                      size={18}
                      className="shrink-0 text-navy-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-navy dark:text-gold"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
