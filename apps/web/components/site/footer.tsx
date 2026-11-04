import Link from 'next/link';
import { Facebook, Linkedin, Send, MessageCircle, MapPin, Phone, Mail } from 'lucide-react';
import { Logo } from './logo';
import { Container } from '@/components/ui/container';
import type { ContactInfo } from '@/lib/api';
import { contactSocials, mailtoHref, telHref } from '@/lib/contact';

export type FooterLink = { label: string; href: string };

/** Product / service columns are built from CMS data; Company links are fixed routes. */
function buildColumns(products: FooterLink[], services: FooterLink[]) {
  return [
    {
      title: 'Products',
      links: [...products, { label: 'All products', href: '/products' }],
    },
    {
      title: 'Services',
      links: [{ label: 'All services', href: '/services' }, ...services],
    },
    companyColumn,
  ];
}

const companyColumn = {
    title: 'Company',
    links: [
      { label: 'About', href: '/company' },
      { label: 'Certificates & Portfolio', href: '/company/certificate-portfolio' },
      { label: 'Meet Our Team', href: '/company/team' },
      { label: 'Gallery', href: '/company/gallery' },
      { label: 'News', href: '/news' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
      { label: 'Request a Quotation', href: '/request-quotation' },
    ],
};

const socialIcons = {
  Facebook,
  LinkedIn: Linkedin,
  Telegram: Send,
  WhatsApp: MessageCircle,
};

export function Footer({
  contact,
  products = [],
  services = [],
}: {
  contact?: ContactInfo | null;
  products?: FooterLink[];
  services?: FooterLink[];
}) {
  const columns = buildColumns(products, services);
  const socials = contactSocials(contact ?? null);
  const hasContact = Boolean(contact?.address || contact?.phone || contact?.email);

  return (
    <footer className="border-t-4 border-gold bg-navy-deep text-white/70">
      <Container className="py-14 md:py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-14">
          <div>
            <Logo light />
            <p className="mt-5 max-w-xs text-[0.9375rem] leading-relaxed">
              RIVET COMPANY supplies elevators, escalators, granite, doors, furniture, sanitary goods
              and building materials for residential and commercial projects in Ethiopia.
            </p>
            {socials.length > 0 && (
              <div className="mt-6 flex gap-2">
                {socials.map((s) => {
                  const Icon = socialIcons[s.label];
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.label}
                      className="grid h-10 w-10 place-items-center rounded-[6px] border border-white/15 text-white/75 transition-colors hover:border-gold hover:text-gold"
                    >
                      <Icon size={16} strokeWidth={1.5} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-gold">
                {col.title}
              </h2>
              <ul className="mt-5 space-y-3 text-[0.9375rem]">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="transition-colors hover:text-white hover:underline hover:underline-offset-4"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {hasContact && (
          <div className="mt-12 grid gap-4 border-t border-white/10 pt-8 text-[0.9375rem] sm:grid-cols-3">
            {contact?.address && (
              <span className="inline-flex items-center gap-2.5">
                <MapPin size={15} className="text-gold" strokeWidth={1.5} /> {contact.address}
              </span>
            )}
            {contact?.phone && (
              <a
                href={telHref(contact.phone)}
                className="inline-flex items-center gap-2.5 transition-colors hover:text-white"
              >
                <Phone size={15} className="text-gold" strokeWidth={1.5} /> {contact.phone}
              </a>
            )}
            {contact?.email && (
              <a
                href={mailtoHref(contact.email)}
                className="inline-flex items-center gap-2.5 transition-colors hover:text-white"
              >
                <Mail size={15} className="text-gold" strokeWidth={1.5} /> {contact.email}
              </a>
            )}
          </div>
        )}

        <div className="mt-8 border-t border-white/10 pt-6 text-[0.8125rem] text-white/60">
          <span>© {new Date().getFullYear()} RIVET COMPANY. All rights reserved.</span>
        </div>
      </Container>
    </footer>
  );
}
