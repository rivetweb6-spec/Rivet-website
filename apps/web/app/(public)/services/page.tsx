import { buttonVariants } from '@/components/ui/button-variants';
import type { Metadata } from 'next';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { PageHero } from '@/components/site/page-hero';
import { Container, Section } from '@/components/ui/container';
import { FadeUp, Stagger, StaggerItem } from '@/components/motion/reveal';
import { RequestQuotationButton } from '@/components/quotation/request-quotation-button';
import { api } from '@/lib/api';
import { metadataForStaticPage } from '@/lib/page-seo';

/** CMS-backed; skip static prerender so `next build` does not require a live API. */
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return metadataForStaticPage('services');
}

export default async function ServicesPage() {
  const { services } = await api.services.list();

  return (
    <>
      <PageHero
        eyebrow="Capabilities"
        title="Import, installation & consultation"
        description="End-to-end capability from sourcing and import to installation, maintenance and engineering consultation across Ethiopia."
      />
      <Section>
        <Container>
          {services.length === 0 && (
            <div className="rounded-[8px] border border-dashed border-border bg-surface/60 px-6 py-14 text-center">
              <h2 className="text-[1.5rem]">Our service listings are being updated</h2>
              <p className="mx-auto mt-3 max-w-lg text-muted">
                RIVET handles product import, installation, maintenance and consultation. Tell us
                about your project and our team will reply with the right service.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/contact"
                  className={buttonVariants({ variant: 'secondary', size: 'md' })}
                >
                  Contact our team
                </Link>
                <Link
                  href="/products"
                  className={buttonVariants({ variant: 'outline', size: 'md' })}
                >
                  Browse products
                </Link>
              </div>
            </div>
          )}
          <Stagger className="grid gap-6 md:grid-cols-2">
            {services.map((s) => {
              const Icon = (Icons[s.icon as keyof typeof Icons] ?? Icons.Wrench) as Icons.LucideIcon;
              return (
                <StaggerItem key={s.id}>
                  <Link href={`/services/${s.slug}`} className="block h-full">
                    <article className="luxury-card group h-full rounded-[8px] bg-canvas p-7 md:p-8">
                      <span className="grid h-12 w-12 place-items-center rounded-[6px] bg-bg text-navy">
                        <Icon size={26} strokeWidth={1.5} />
                      </span>
                      <h2 className="mt-6 text-[1.5rem]">{s.title}</h2>
                      <p className="mt-4 leading-relaxed text-muted">{s.narrative}</p>
                      <p className="mt-6 text-[0.9375rem] font-semibold text-navy group-hover:underline group-hover:underline-offset-4">Learn more →</p>
                    </article>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>

          <FadeUp className="mt-20 rounded-[8px] bg-navy px-8 py-14 text-center md:px-16">
            <h2 className="text-[1.75rem] text-white sm:text-[2.25rem]">
              Need a tailored engagement?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70">
              Request a quotation and we will match RIVET capabilities to your project in Ethiopia.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <RequestQuotationButton />
              <Link
                href="/request-quotation"
                className={buttonVariants({ variant: 'ghost', size: 'lg' })}
              >
                Open full quotation form
              </Link>
            </div>
          </FadeUp>
        </Container>
      </Section>
    </>
  );
}
