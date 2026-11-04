import type { Metadata } from 'next';
import { Facebook, Linkedin, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { PageHero } from '@/components/site/page-hero';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { ContactForm } from '@/components/contact/contact-form';
import { api } from '@/lib/api';
import { contactSocials, mailtoHref, telHref } from '@/lib/contact';
import { metadataForStaticPage } from '@/lib/page-seo';

/** CMS-backed; skip static prerender so `next build` does not require a live API. */
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return metadataForStaticPage('contact');
}

export default async function ContactPage() {
  const { info } = await api.contactInfo();
  const mapSrc =
    info?.mapLat && info?.mapLng
      ? `https://www.google.com/maps?q=${info.mapLat},${info.mapLng}&z=14&output=embed`
      : 'https://www.google.com/maps?q=Addis+Ababa&z=12&output=embed';

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
        title="Contact River Company"
        description="Speak with a RIVET specialist about products, installation, or request a quotation."
      />
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <Eyebrow>Reach us</Eyebrow>
              <h2 className="headline-display mt-3 text-[2rem]">Office & channels</h2>
              {!hasChannels && (
                <p className="mt-6 rounded-[8px] border border-border bg-surface px-5 py-4 text-[0.9375rem] leading-relaxed text-muted">
                  Our direct phone and email details are being updated. The quickest way to reach a
                  RIVET specialist is the{' '}
                  <a href="#contact-form" className="font-medium text-navy underline underline-offset-4 hover:no-underline">
                    contact form
                  </a>{' '}
                  — we reply within one business day.
                </p>
              )}
              <ul className="mt-8 space-y-5 text-[0.9375rem]">
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
                        className="grid h-11 w-11 place-items-center rounded-[6px] border border-border text-navy transition-colors hover:border-navy hover:bg-bg dark:hover:border-gold"
                      >
                        <Icon size={18} />
                      </a>
                    );
                  })}
                </div>
              )}

              <div className="mt-10 overflow-hidden rounded-[8px] border border-border">
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
