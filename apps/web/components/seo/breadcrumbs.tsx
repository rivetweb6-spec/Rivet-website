import Link from 'next/link';
import { BreadcrumbJsonLd } from '@/components/seo/json-ld';

export type BreadcrumbItem = { name: string; path: string };

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (!items.length) return null;

  return (
    <>
      <BreadcrumbJsonLd items={items} />
      <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-muted">
        <ol className="flex flex-wrap items-center gap-y-1">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={`${item.path}-${item.name}`} className="flex items-center">
                {i > 0 && (
                  <span className="mx-2" aria-hidden="true">
                    /
                  </span>
                )}
                {isLast ? (
                  <span className="text-ink" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.path} className="hover:text-gold focus-visible:text-gold">
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
