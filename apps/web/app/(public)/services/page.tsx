import { buttonVariants } from '@/components/ui/button-variants';
import type { Metadata } from 'next';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { PageHero } from '@/components/site/page-hero';
import { StateMessage } from '@/components/ui/state-message';
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
        eyebrow="Services"
        title="Supply, installation and maintenance"
        description="From product import and elevator installation to maintenance, granite supply and construction consultation, RIVET COMPANY supports your project from specification to handover."
      />
      <Section>
        <Container>
          {services.length === 0 && (
            <StateMessage
              icon={Icons.Wrench}
              title="Our service listings are being updated"
              actions={
                <>
                  <Link href="/contact" className={buttonVariants({ variant: 'secondary', size: 'md' })}>
                    Contact our team
                  </Link>
                  <Link href="/products" className={buttonVariants({ variant: 'outline', size: 'md' })}>
                    Browse products
                  </Link>
                </>
              }
            >
              RIVET COMPANY provides product import, installation, maintenance and consultation. Tell
              us about your project and we will recommend the right service.
            </StateMessage>
          )}
          <Stagger className="grid gap-6 md:grid-cols-2">
            {services.map((s) => {
              const Icon = (Icons[s.icon as keyof typeof Icons] ?? Icons.Wrench) as Icons.LucideIcon;
              return (
                <StaggerItem key={s.id}>
                  <Link href={`/services/${s.slug}`} className="block h-full">
                    <article className="luxury-card group h-full rounded-lg bg-canvas p-7 md:p-8">
                      <span className="grid h-12 w-12 place-items-center rounded-md bg-bg text-navy">
                        <Icon size={26} strokeWidth={1.5} />
                      </span>
                      <h2 className="mt-6 text-2xl">{s.title}</h2>
                      <p className="mt-4 leading-relaxed text-muted">{s.narrative}</p>
                      <p className="mt-6 text-sm font-semibold text-navy group-hover:underline group-focus-visible:underline group-hover:underline-offset-4">Learn more →</p>
                    </article>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>

          <FadeUp className="mt-20 rounded-lg bg-navy px-8 py-14 text-center md:px-16">
            <h2 className="text-3xl text-white sm:text-5xl">
              Planning a project?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70">
              Request a quotation and our team will recommend the right products and services for your building.
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
