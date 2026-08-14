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
