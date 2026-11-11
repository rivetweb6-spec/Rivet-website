'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { companyNavLinks } from '@/lib/company-nav';
import { Container } from '@/components/ui/container';
import { ScrollNav } from '@/components/ui/scroll-nav';
import { cn } from '@/lib/utils';

export function CompanySubnav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-border bg-canvas">
      <Container>
        <ScrollNav
          aria-label="Company pages"
          className="-mb-px flex gap-6 overflow-x-auto md:gap-8"
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
                  'shrink-0 border-b-2 py-4 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-offset-[-2px]',
                  active
                    ? 'border-gold text-navy'
                    : 'border-transparent text-muted hover:border-border hover:text-navy',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </ScrollNav>
      </Container>
    </div>
  );
}
