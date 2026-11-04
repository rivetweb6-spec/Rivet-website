'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { companyNavLinks } from '@/lib/company-nav';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils';

export function CompanySubnav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-gold/15 bg-navy-deep">
      <Container>
        <nav
          aria-label="Company pages"
          className="flex flex-wrap gap-1 py-3"
        >
          {companyNavLinks.map((link) => {
            const active = 'exact' in link && link.exact
              ? pathname === link.href
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-[0.8125rem] tracking-wide transition-colors',
                  active
                    ? 'bg-gold text-navy'
                    : 'text-white/70 hover:bg-white/8 hover:text-white',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </Container>
    </div>
  );
}
