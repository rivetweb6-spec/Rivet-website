import type { Metadata } from 'next';
import { Facebook, Linkedin, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { PageHero } from '@/components/site/page-hero';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { ContactForm } from '@/components/contact/contact-form';
import { api } from '@/lib/api';

import { resolveSeo } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  let page = null;
  try {
    ({ page } = await api.pageSeo.byKey('contact'));
  } catch {
    /* defaults */
  }
  return resolveSeo(page, {
    title: 'Contact Rivet in Addis Ababa, Ethiopia',
    description:
      'Contact River Company (RIVET) in Addis Ababa — office, phone, email and social channels. Request a quotation for elevators, granite, doors and more.',
    path: '/contact',
  });
}

export default async function ContactPage() {
  const { info } = await api.contactInfo();
  const mapSrc =
    info?.mapLat && info?.mapLng
      ? `https://www.google.com/maps?q=${info.mapLat},${info.mapLng}&z=14&output=embed`
      : 'https://www.google.com/maps?q=Addis+Ababa&z=12&output=embed';

  const socials = [
    { href: info?.whatsapp ? `https://wa.me/${info.whatsapp.replace(/\D/g, '')}` : '#', icon: MessageCircle, label: 'WhatsApp' },
    { href: info?.facebook ?? '#', icon: Facebook, label: 'Facebook' },
    { href: info?.linkedin ?? '#', icon: Linkedin, label: 'LinkedIn' },
    { href: info?.telegram ?? '#', icon: Send, label: 'Telegram' },
  ];

  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="Contact"
        description="Speak with a RIVET specialist about products, installation, or request a quotation."
      />
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <Eyebrow>Reach us</Eyebrow>
              <h2 className="mt-3 text-[2rem]">Office & channels</h2>
              <ul className="mt-8 space-y-5 text-[0.9375rem]">
                {info?.address && (
                  <li className="flex items-start gap-3">
                    <MapPin size={18} className="mt-0.5 text-gold" />
                    <span>{info.address}</span>
                  </li>
                )}
                {info?.phone && (
                  <li className="flex items-start gap-3">
                    <Phone size={18} className="mt-0.5 text-gold" />
                    <a href={`tel:${info.phone}`} className="transition-colors hover:text-gold">
                      {info.phone}
                    </a>
                  </li>
                )}
                {info?.email && (
                  <li className="flex items-start gap-3">
                    <Mail size={18} className="mt-0.5 text-gold" />
                    <a href={`mailto:${info.email}`} className="transition-colors hover:text-gold">
                      {info.email}
                    </a>
                  </li>
                )}
              </ul>

              <div className="mt-8 flex gap-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="grid h-11 w-11 place-items-center rounded-full border border-border text-navy transition-all hover:border-gold hover:text-gold"
                  >
                    <s.icon size={18} />
                  </a>
                ))}
              </div>

              <div className="mt-10 overflow-hidden rounded-[16px] border border-border shadow-[var(--shadow-sm)]">
                <iframe
                  title="RIVET office location"
                  src={mapSrc}
                  className="h-64 w-full grayscale-[30%] contrast-[1.05] saturate-[0.7]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            <ContactForm />
          </div>
        </Container>
      </Section>
    </>
  );
}
