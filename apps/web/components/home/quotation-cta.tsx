'use client';

import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { FadeUp } from '@/components/motion/reveal';
import { useQuotationModal } from '@/components/quotation/quotation-modal-provider';

export function QuotationCta() {
  const { open } = useQuotationModal();
  return (
    <section className="relative overflow-hidden bg-navy-deep py-32 md:py-40 luxury-grain">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(214,154,46,0.12),transparent_60%)]"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 top-0 gold-rule opacity-25" aria-hidden="true" />
      <Container className="relative">
        <FadeUp>
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow text-gold">Project pricing</p>
            <h2 className="headline-display mt-6 text-[2.5rem] text-white sm:text-[3.25rem] lg:text-[3.75rem]">
              Request a tailored quotation.
            </h2>
            <p className="mx-auto mt-7 max-w-lg text-[1.0625rem] font-light leading-[1.8] text-white/60">
              Share your project requirements and receive a detailed quotation from RIVET&apos;s
              specialists — covering products, delivery and installation.
            </p>
            <div className="mt-12 flex justify-center">
              <Button variant="primary" size="lg" onClick={() => open()}>
                Request a Quotation
              </Button>
            </div>
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}
