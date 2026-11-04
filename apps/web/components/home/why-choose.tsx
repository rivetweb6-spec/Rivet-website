import * as Icons from 'lucide-react';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { Stagger, StaggerItem } from '@/components/motion/reveal';
import { advantages } from '@/lib/data/content';

export function WhyChoose() {
  return (
    <Section className="bg-surface">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)] lg:gap-16">
          <div>
            <Eyebrow>Why River Company</Eyebrow>
            <h2 className="headline-display mt-3 text-[2rem] sm:text-[2.5rem]">
              The confidence of engineered quality.
            </h2>
          </div>

          <Stagger className="grid gap-x-8 sm:grid-cols-2">
            {advantages.map((a) => {
              const Icon = (Icons[a.icon as keyof typeof Icons] ?? Icons.Check) as Icons.LucideIcon;
              return (
                <StaggerItem key={a.title}>
                  <div className="flex items-center gap-4 border-b border-border py-5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[6px] bg-bg text-navy">
                      <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <h3 className="text-[1rem] font-semibold text-ink">{a.title}</h3>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </Container>
    </Section>
  );
}
