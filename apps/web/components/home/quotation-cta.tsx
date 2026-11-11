import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button-variants';
import { Container } from '@/components/ui/container';
import { RequestQuotationButton } from '@/components/quotation/request-quotation-button';

/** Closing call to action: navy band, copy left, actions right. */
export function QuotationCta() {
  return (
    <section aria-labelledby="quotation-cta-title" className="on-dark bg-navy py-14 md:py-16">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-gold">Quotations</p>
            <h2
              id="quotation-cta-title"
              className="headline-display mt-3 text-4xl text-white sm:text-5xl"
            >
              Request a quotation for your project.
            </h2>
            <p className="mt-3 text-md leading-relaxed text-white/80">
              Tell us the product, quantity and site details. A RIVET COMPANY specialist will prepare
              a tailored quotation covering supply, delivery and installation.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <RequestQuotationButton />
            <Link href="/request-quotation" className={buttonVariants({ variant: 'ghost', size: 'lg' })}>
              Use the full form
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
