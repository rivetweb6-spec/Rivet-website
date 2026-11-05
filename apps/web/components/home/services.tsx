import Link from 'next/link';
import * as Icons from 'lucide-react';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { Stagger, StaggerItem } from '@/components/motion/reveal';
import { services as fallbackServices } from '@/lib/data/content';

export type ServiceCard = {
  slug: string;
  title: string;
  statement: string;
  icon: string | null;
};

export function Services({ items }: { items?: ServiceCard[] }) {
  // `undefined` = API unreachable (dev fallback OK). `[]` = API empty — do not invent links.
  const list = items === undefined ? fallbackServices : items;

  if (list.length === 0) return null;

  return (
    <Section>
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-12">
          <div className="max-w-2xl">
            <Eyebrow>Services</Eyebrow>
            <h2 className="headline-display mt-3 text-[2rem] sm:text-[2.5rem]">Supply, installation and maintenance</h2>
            <p className="mt-4 leading-relaxed text-muted">
              Product import, elevator installation and maintenance, granite and building material
              supply, and construction consultation — coordinated by one team.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-navy underline-offset-4 hover:underline"
          >
            All services
            <Icons.ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => {
            const Icon = (Icons[s.icon as keyof typeof Icons] ?? Icons.Wrench) as Icons.LucideIcon;
            return (
              <StaggerItem key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="luxury-card group flex h-full flex-col rounded-[8px] bg-canvas p-6 md:p-7"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-[6px] bg-bg text-navy">
                    <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-[1.1875rem]">{s.title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{s.statement}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[0.9375rem] font-semibold text-navy">
                    Learn more
                    <Icons.ArrowRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </Section>
  );
}
