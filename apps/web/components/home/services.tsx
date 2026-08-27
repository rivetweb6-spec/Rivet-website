import Link from 'next/link';
import * as Icons from 'lucide-react';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { FadeUp, Stagger, StaggerItem } from '@/components/motion/reveal';
import { services as fallbackServices } from '@/lib/data/content';

export type ServiceCard = {
  slug: string;
  title: string;
  statement: string;
  icon: string | null;
};

export function Services({ items }: { items?: ServiceCard[] }) {
  const list = items && items.length > 0 ? items : fallbackServices;

  return (
    <Section className="bg-pearl">
      <Container>
        <FadeUp>
          <div className="mb-16 max-w-2xl">
            <Eyebrow>What We Do</Eyebrow>
            <h2 className="headline-display mt-5 text-[2.25rem] sm:text-[2.75rem]">Services</h2>
            <p className="mt-5 font-light leading-relaxed text-muted">
              End-to-end capability, from sourcing and import to installation, maintenance and
              engineering consultation.
            </p>
          </div>
        </FadeUp>

        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => {
            const Icon = (Icons[s.icon as keyof typeof Icons] ?? Icons.Wrench) as Icons.LucideIcon;
            return (
              <StaggerItem key={s.slug}>
                <Link href={`/services/${s.slug}`} className="block h-full">
                  <article className="group h-full rounded-[4px] border border-border/70 bg-canvas p-9 transition-all duration-700 hover:-translate-y-1 hover:border-gold/30 hover:shadow-[var(--shadow-lg)]">
                    <span className="grid h-14 w-14 place-items-center rounded-full border border-champagne text-navy transition-all duration-500 group-hover:border-gold group-hover:bg-gold/10 group-hover:text-gold">
                      <Icon size={24} strokeWidth={1.25} />
                    </span>
                    <h3 className="headline-display mt-7 text-[1.375rem]">{s.title}</h3>
                    <p className="mt-3 text-[0.9375rem] font-light leading-[1.75] text-muted">
                      {s.statement}
                    </p>
                    <p className="mt-6 text-[0.875rem] font-medium text-gold">Learn more →</p>
                  </article>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </Section>
  );
}
