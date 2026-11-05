import type { ContactInfo } from '@/lib/api';

export function telHref(phone: string) {
  const compact = phone.replace(/[^\d+]/g, '');
  return `tel:${compact || phone}`;
}

export function mailtoHref(email: string) {
  return `mailto:${email}`;
}

export function whatsappHref(whatsapp: string) {
  const digits = whatsapp.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : whatsapp;
}

/** RIVET COMPANY office, Addis Ababa. Admin → Contact coordinates override these. */
export const OFFICE_COORDS = { lat: 8.9939223, lng: 38.7943463 };

/**
 * True for a real social profile URL (https with a path), false for empty
 * values and placeholders such as "https://facebook.com". Used for schema.org
 * `sameAs`, where a bare domain would tell Google the wrong profile is ours.
 */
export function isProfileUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value.trim());
    return /^https?:$/.test(url.protocol) && url.pathname.replace(/\/+$/, '').length > 1;
  } catch {
    return false;
  }
}

export function contactSocials(info: Pick<
  ContactInfo,
  'facebook' | 'linkedin' | 'telegram' | 'whatsapp'
> | null) {
  if (!info) return [];
  return [
    { label: 'Facebook' as const, href: info.facebook },
    { label: 'LinkedIn' as const, href: info.linkedin },
    { label: 'Telegram' as const, href: info.telegram },
    { label: 'WhatsApp' as const, href: info.whatsapp ? whatsappHref(info.whatsapp) : null },
  ].filter((s): s is { label: 'Facebook' | 'LinkedIn' | 'Telegram' | 'WhatsApp'; href: string } =>
    Boolean(s.href),
  );
}
