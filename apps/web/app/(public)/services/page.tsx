import type { Metadata } from 'next';
import * as Icons from 'lucide-react';
import { PageHero } from '@/components/site/page-hero';
import { Container, Section } from '@/components/ui/container';
import { FadeUp, Stagger, StaggerItem } from '@/components/motion/reveal';
import { DemoRequestButton } from '@/components/demo/demo-request-button';
import { api } from '@/lib/api';

import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Services',
  description: 'Import, installation, maintenance, granite supply and construction consultation.',
  path: '/services',
});

export default async function ServicesPage() {
  const { services } = await api.services.list();

  return (
    <>
      <PageHero
        eyebrow="Capabilities"
        title="Services"
        description="End-to-end capability from sourcing and import to installation, maintenance and engineering consultation."
      />
      <Section>
        <Container>
          <Stagger className="grid gap-6 md:grid-cols-2">
            {services.map((s) => {
              const Icon = (Icons[s.icon as keyof typeof Icons] ?? Icons.Wrench) as Icons.LucideIcon;
              return (
                <StaggerItem key={s.id}>
                  <article className="group h-full rounded-[20px] border border-border bg-surface p-8 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[var(--shadow-lg)] md:p-10">
                    <span className="grid h-14 w-14 place-items-center rounded-[12px] bg-navy/5 text-navy transition-colors duration-500 group-hover:bg-gold group-hover:text-navy">
                      <Icon size={26} strokeWidth={1.5} />
                    </span>
                    <h2 className="mt-6 text-[1.5rem]">{s.title}</h2>
                    <p className="mt-4 leading-relaxed text-muted">{s.narrative}</p>
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>

          <FadeUp className="mt-20 rounded-[20px] bg-navy px-8 py-14 text-center md:px-16">
            <h2 className="text-[1.75rem] text-white sm:text-[2.25rem]">
              Need a tailored engagement?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70">
              Request a private demonstration and we will match RIVET capabilities to your project.
            </p>
            <div className="mt-8 flex justify-center">
              <DemoRequestButton />
            </div>
          </FadeUp>
        </Container>
      </Section>
    </>
  );
}
