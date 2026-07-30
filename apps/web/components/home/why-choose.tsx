import * as Icons from 'lucide-react';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { FadeUp, Stagger, StaggerItem } from '@/components/motion/reveal';
import { advantages } from '@/lib/data/content';

export function WhyChoose() {
  return (
    <Section>
      <Container>
        <FadeUp>
          <div className="mb-16 max-w-2xl rivet-line lg:pl-8">
            <Eyebrow>Why River Company</Eyebrow>
            <h2 className="headline-display mt-5 text-[2.25rem] sm:text-[2.75rem]">
              The confidence of engineered quality.
            </h2>
          </div>
        </FadeUp>

        <Stagger className="grid gap-x-12 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((a) => {
            const Icon = (Icons[a.icon as keyof typeof Icons] ?? Icons.Check) as Icons.LucideIcon;
            return (
              <StaggerItem key={a.title}>
                <div className="group flex items-center gap-5 border-b border-divider py-7 transition-colors duration-500 hover:border-gold/40">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border text-navy transition-all duration-500 group-hover:border-gold group-hover:text-gold">
                    <Icon size={20} strokeWidth={1.25} />
                  </span>
                  <h3 className="text-[1.0625rem] font-medium tracking-wide text-ink">{a.title}</h3>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </Section>
  );
}
