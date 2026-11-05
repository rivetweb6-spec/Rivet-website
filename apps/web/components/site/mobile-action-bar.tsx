'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuotationModal } from '@/components/quotation/quotation-modal-provider';
import { telHref, whatsappHref } from '@/lib/contact';
import { cn } from '@/lib/utils';

/**
 * Phone/tablet-only action bar fixed to the bottom of the screen. Appears once
 * the visitor scrolls past the first screen so the quotation action is always
 * one tap away. Hidden on the quotation page (the form is already there).
 */
export function MobileActionBar({
  phone,
  whatsapp,
}: {
  phone?: string | null;
  whatsapp?: string | null;
}) {
  const { open } = useQuotationModal();
  const pathname = usePathname();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (pathname.startsWith('/request-quotation')) return null;

  const iconLink =
    'grid h-12 w-12 shrink-0 place-items-center rounded-[6px] border border-border text-navy transition-colors hover:border-navy hover:bg-bg dark:hover:border-gold';

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-canvas/95 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur transition-transform duration-300 lg:hidden',
        visible ? 'translate-y-0' : 'pointer-events-none translate-y-full',
      )}
    >
      <div className="mx-auto flex max-w-[1280px] items-center gap-2 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
        <Button size="lg" className="min-w-0 flex-1 px-3 sm:px-6" tabIndex={visible ? 0 : -1} onClick={() => open()}>
          Request a Quotation
        </Button>
        {phone && (
          <a
            href={telHref(phone)}
            aria-label={`Call ${phone}`}
            tabIndex={visible ? 0 : -1}
            className={iconLink}
          >
            <Phone size={20} strokeWidth={1.75} aria-hidden="true" />
          </a>
        )}
        {whatsapp && (
          <a
            href={whatsappHref(whatsapp)}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat on WhatsApp"
            tabIndex={visible ? 0 : -1}
            className={iconLink}
          >
            <MessageCircle size={20} strokeWidth={1.75} aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}
