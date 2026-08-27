import type { Metadata } from 'next';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { PageHero } from '@/components/site/page-hero';
import { Container, Section } from '@/components/ui/container';
import { FadeUp, Stagger, StaggerItem } from '@/components/motion/reveal';
import { RequestQuotationButton } from '@/components/quotation/request-quotation-button';
import { api } from '@/lib/api';
import { metadataForStaticPage } from '@/lib/page-seo';

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
          <Stagger className="grid gap-6 md:grid-cols-2">
            {services.map((s) => {
              const Icon = (Icons[s.icon as keyof typeof Icons] ?? Icons.Wrench) as Icons.LucideIcon;
              return (
                <StaggerItem key={s.id}>
                  <Link href={`/services/${s.slug}`} className="block h-full">
                    <article className="group h-full rounded-[20px] border border-border bg-surface p-8 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[var(--shadow-lg)] md:p-10">
                      <span className="grid h-14 w-14 place-items-center rounded-[12px] bg-navy/5 text-navy transition-colors duration-500 group-hover:bg-gold group-hover:text-navy">
                        <Icon size={26} strokeWidth={1.5} />
                      </span>
                      <h2 className="mt-6 text-[1.5rem]">{s.title}</h2>
                      <p className="mt-4 leading-relaxed text-muted">{s.narrative}</p>
                      <p className="mt-6 text-[0.875rem] font-medium text-gold">Learn more →</p>
                    </article>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>

          <FadeUp className="mt-20 rounded-[20px] bg-navy px-8 py-14 text-center md:px-16">
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
                className="inline-flex h-14 items-center justify-center rounded-[12px] border border-white/25 px-8 text-[1rem] font-medium text-white transition-all hover:border-gold hover:text-gold"
              >
                Quotation page
              </Link>
            </div>
          </FadeUp>
        </Container>
      </Section>
    </>
  );
}
