import Link from 'next/link';
import { Facebook, Linkedin, Send, MessageCircle, MapPin, Phone, Mail } from 'lucide-react';
import { Logo } from './logo';
import { Container } from '@/components/ui/container';

const columns = [
  {
    title: 'Products',
    links: [
      { label: 'Elevators', href: '/products?category=elevators' },
      { label: 'Passenger Lifts', href: '/products?category=passenger-lifts' },
      { label: 'Granite', href: '/products?category=granite' },
      { label: 'Doors', href: '/products?category=doors' },
      { label: 'All products', href: '/products' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'All services', href: '/services' },
      { label: 'Installation', href: '/services' },
      { label: 'Maintenance', href: '/services' },
      { label: 'Consultation', href: '/services' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/company' },
      { label: 'News', href: '/news' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];

const socials = [
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Send, label: 'Telegram', href: '#' },
  { icon: MessageCircle, label: 'WhatsApp', href: '#' },
];

export function Footer() {
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
            <div className="mt-8 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/50 transition-all duration-500 hover:border-gold hover:text-gold"
                >
                  <s.icon size={16} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-gold">
                {col.title}
              </h4>
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

        <div className="mt-16 grid gap-5 border-t border-white/8 pt-10 text-[0.875rem] font-light sm:grid-cols-3">
          <span className="inline-flex items-center gap-2.5">
            <MapPin size={15} className="text-gold" strokeWidth={1.5} /> Addis Ababa, Ethiopia
          </span>
          <a
            href="tel:+251000000000"
            className="inline-flex items-center gap-2.5 transition-colors hover:text-gold"
          >
            <Phone size={15} className="text-gold" strokeWidth={1.5} /> +251 00 000 0000
          </a>
          <a
            href="mailto:info@rivet.com"
            className="inline-flex items-center gap-2.5 transition-colors hover:text-gold"
          >
            <Mail size={15} className="text-gold" strokeWidth={1.5} /> info@rivet.com
          </a>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-4 border-t border-white/8 pt-8 text-[0.75rem] text-white/35 sm:flex-row">
          <span>© {new Date().getFullYear()} River Company (RIVET). All rights reserved.</span>
          <div className="flex gap-8">
            <Link href="/contact" className="transition-colors hover:text-gold">
              Privacy Policy
            </Link>
            <Link href="/contact" className="transition-colors hover:text-gold">
              Terms
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
