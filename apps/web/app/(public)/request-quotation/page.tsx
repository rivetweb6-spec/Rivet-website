import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/site/page-hero';
import { Container, Section } from '@/components/ui/container';
import { QuotationForm } from '@/components/quotation/quotation-form';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { metadataForStaticPage } from '@/lib/page-seo';

/** CMS-backed; skip static prerender so `next build` does not require a live API. */
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return metadataForStaticPage('request-quotation');
}

export default async function RequestQuotationPage() {
  return (
    <>
      <PageHero
        lead={
          <div>
            <Breadcrumbs
              items={[
                { name: 'Home', path: '/' },
                { name: 'Request a Quotation', path: '/request-quotation' },
              ]}
            />
          </div>
        }
        eyebrow="Quotations"
        title="Request a quotation"
        description="Tell us about your project and we will prepare a tailored quotation for elevators, escalators, granite, doors, furniture, sanitary goods or building materials."
      />
      <Section>
        <Container>
          <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <h2 className="headline-display text-[1.5rem] sm:text-[1.75rem]">How it works</h2>
              <ol className="mt-6 space-y-4 text-[0.9375rem] leading-relaxed text-muted">
                <li>
                  <strong className="text-ink">1. Share your needs</strong> — product category,
                  quantity, and project details.
                </li>
                <li>
                  <strong className="text-ink">2. We review</strong> — a RIVET COMPANY specialist
                  matches supply options to your specification.
                </li>
                <li>
                  <strong className="text-ink">3. Receive a quotation</strong> — clear pricing and
                  next steps for your project.
                </li>
              </ol>
              <p className="mt-8 text-[0.9375rem] text-muted">
                Prefer to browse first?{' '}
                <Link href="/products" className="text-navy font-semibold underline-offset-4 hover:underline">
                  Explore products
                </Link>{' '}
                or{' '}
                <Link href="/contact" className="text-navy font-semibold underline-offset-4 hover:underline">
                  contact our team
                </Link>
                .
              </p>
            </div>
            <QuotationForm />
          </div>
        </Container>
      </Section>
    </>
  );
}
