import { Container } from '@/components/ui/container';
import { CountUp } from '@/components/motion/count-up';
import { FadeUp } from '@/components/motion/reveal';
import { stats } from '@/lib/data/content';

export function Stats() {
  return (
    <section className="relative overflow-hidden bg-navy-deep py-28 md:py-36 luxury-grain">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(214,154,46,0.06),transparent_70%)]"
        aria-hidden="true"
      />
      <Container className="relative">
        <FadeUp>
          <div className="grid gap-12 text-center sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {stats.map((s) => (
              <div key={s.label} className="group">
                <div className="headline-display text-[3.25rem] font-medium leading-none text-gold-shimmer lg:text-[3.75rem]">
                  <CountUp value={s.value} suffix={s.suffix} />
                </div>
                <div className="mx-auto mt-5 h-px w-12 bg-gradient-to-r from-transparent via-gold to-transparent transition-all duration-700 group-hover:w-20" />
                <p className="mt-5 text-[0.875rem] font-light tracking-wide text-white/60">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </FadeUp>
      </Container>
      <div className="absolute inset-x-0 bottom-0 gold-rule opacity-30" aria-hidden="true" />
    </section>
  );
}
