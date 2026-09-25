import Link from 'next/link';
import { Facebook, Linkedin, Send, MessageCircle, MapPin, Phone, Mail } from 'lucide-react';
import { Logo } from './logo';
import { Container } from '@/components/ui/container';
import type { ContactInfo } from '@/lib/api';
import { contactSocials, mailtoHref, telHref } from '@/lib/contact';

const columns = [
  {
    title: 'Products',
    links: [
      { label: 'Elevators', href: '/products/elevators' },
      { label: 'Passenger Lifts', href: '/products/passenger-lifts' },
      { label: 'Granite', href: '/products/granite' },
      { label: 'Doors', href: '/products/doors' },
      { label: 'All products', href: '/products' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'All services', href: '/services' },
      { label: 'Elevator Installation', href: '/services/elevator-installation' },
      { label: 'Elevator Maintenance', href: '/services/elevator-maintenance' },
      { label: 'Granite Supply', href: '/services/granite-supply' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/company' },
      { label: 'Certificate & Portfolio', href: '/company/certificate-portfolio' },
      { label: 'Meet Our Team', href: '/company/team' },
      { label: 'Gallery', href: '/company/gallery' },
      { label: 'News', href: '/news' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
      { label: 'Request a Quotation', href: '/request-quotation' },
    ],
  },
];

const socialIcons = {
  Facebook,
  LinkedIn: Linkedin,
  Telegram: Send,
  WhatsApp: MessageCircle,
};

export function Footer({ contact }: { contact?: ContactInfo | null }) {
  const socials = contactSocials(contact ?? null);
  const hasContact = Boolean(contact?.address || contact?.phone || contact?.email);

  return (
    <footer className="relative bg-navy-deep text-white/60 luxury-grain">
      <div className="gold-rule opacity-30" aria-hidden="true" />
      <Container className="py-24">
        <div className="grid gap-14 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-6 max-w-xs text-[0.875rem] font-light leading-[1.8]">
              River Company (RIVET) imports and supplies premium construction and architectural
              products — engineered precision for landmark spaces.
            </p>
            {socials.length > 0 && (
              <div className="mt-8 flex gap-3">
                {socials.map((s) => {
                  const Icon = socialIcons[s.label];
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.label}
                      className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/50 transition-all duration-500 hover:border-gold hover:text-gold"
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
              <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-gold">
                {col.title}
              </h2>
              <ul className="mt-6 space-y-3.5 text-[0.875rem] font-light">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="transition-colors duration-300 hover:text-gold"
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
          <div className="mt-16 grid gap-5 border-t border-white/8 pt-10 text-[0.875rem] font-light sm:grid-cols-3">
            {contact?.address && (
              <span className="inline-flex items-center gap-2.5">
                <MapPin size={15} className="text-gold" strokeWidth={1.5} /> {contact.address}
              </span>
            )}
            {contact?.phone && (
              <a
                href={telHref(contact.phone)}
                className="inline-flex items-center gap-2.5 transition-colors hover:text-gold"
              >
                <Phone size={15} className="text-gold" strokeWidth={1.5} /> {contact.phone}
              </a>
            )}
            {contact?.email && (
              <a
                href={mailtoHref(contact.email)}
                className="inline-flex items-center gap-2.5 transition-colors hover:text-gold"
              >
                <Mail size={15} className="text-gold" strokeWidth={1.5} /> {contact.email}
              </a>
            )}
          </div>
        )}

        <div className="mt-10 border-t border-white/8 pt-8 text-[0.75rem] text-white/35">
          <span>© {new Date().getFullYear()} River Company (RIVET). All rights reserved.</span>
        </div>
      </Container>
    </footer>
  );
}
