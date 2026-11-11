import type { Metadata } from 'next';
import { Facebook, Linkedin, Mail, MapPin, MessageCircle, Navigation, Phone, Send } from 'lucide-react';
import { PageHero } from '@/components/site/page-hero';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { ContactForm } from '@/components/contact/contact-form';
import { api } from '@/lib/api';
import { contactSocials, mailtoHref, OFFICE_COORDS, telHref } from '@/lib/contact';
import { metadataForStaticPage } from '@/lib/page-seo';

/** CMS-backed; skip static prerender so `next build` does not require a live API. */
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return metadataForStaticPage('contact');
}

export default async function ContactPage() {
  const { info } = await api.contactInfo();
  const lat = info?.mapLat ?? OFFICE_COORDS.lat;
  const lng = info?.mapLng ?? OFFICE_COORDS.lng;
  // Interactive embed (pan/zoom) pinned on the office.
  const mapSrc = `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const socialIcons = {
    Facebook,
    LinkedIn: Linkedin,
    Telegram: Send,
    WhatsApp: MessageCircle,
  };
  const socials = contactSocials(info);
  const hasChannels = Boolean(info?.address || info?.phone || info?.email);

  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="Contact RIVET COMPANY"
        description="Speak with our team about elevators, escalators, building materials or a project quotation."
      />
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <Eyebrow>Contact details</Eyebrow>
              <h2 className="headline-display mt-3 text-4xl">Get in touch</h2>
              {!hasChannels && (
                <p className="mt-6 rounded-lg border border-border bg-surface px-5 py-4 text-sm leading-relaxed text-muted">
                  Our direct phone and email details are being updated. The quickest way to reach
                  our team is the{' '}
                  <a href="#contact-form" className="font-medium text-navy underline underline-offset-4 hover:no-underline">
                    contact form
                  </a>{' '}
                  — a member of our team will get back to you.
                </p>
              )}
              <ul className="mt-8 space-y-5 text-sm">
                {info?.address && (
                  <li className="flex items-start gap-3">
                    <MapPin size={18} className="mt-0.5 shrink-0 text-navy dark:text-gold" aria-hidden="true" />
                    <span>{info.address}</span>
                  </li>
                )}
                {info?.phone && (
                  <li className="flex items-start gap-3">
                    <Phone size={18} className="mt-0.5 shrink-0 text-navy dark:text-gold" aria-hidden="true" />
                    <a href={telHref(info.phone)} className="transition-colors underline-offset-4 hover:underline">
                      {info.phone}
                    </a>
                  </li>
                )}
                {info?.email && (
                  <li className="flex items-start gap-3">
                    <Mail size={18} className="mt-0.5 shrink-0 text-navy dark:text-gold" aria-hidden="true" />
                    <a href={mailtoHref(info.email)} className="transition-colors underline-offset-4 hover:underline">
                      {info.email}
                    </a>
                  </li>
                )}
              </ul>

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
                        className="grid h-11 w-11 place-items-center rounded-md border border-border text-navy transition-colors hover:border-navy hover:bg-bg dark:hover:border-gold"
                      >
                        <Icon size={18} />
                      </a>
                    );
                  })}
                </div>
              )}

              <div className="mt-10 overflow-hidden rounded-lg border border-border">
                <iframe
                  title="RIVET COMPANY office location in Addis Ababa (interactive map)"
                  src={mapSrc}
                  className="block h-64 w-full grayscale-[30%] contrast-[1.05] saturate-[0.7] sm:h-72"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 py-1.5 text-sm font-semibold text-navy underline-offset-4 hover:underline "
              >
                <Navigation size={16} aria-hidden="true" />
                Get directions
                <span className="sr-only"> (opens Google Maps in a new tab)</span>
              </a>
            </div>

            <ContactForm />
          </div>
        </Container>
      </Section>
    </>
  );
}
