import { Container, Eyebrow } from '@/components/ui/container';

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-deep pt-36 pb-20 md:pt-44 md:pb-24 luxury-grain">
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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(214,154,46,0.08),transparent_50%)]"
        aria-hidden="true"
      />
      <Container className="relative">
        <div className="rivet-line max-w-3xl lg:pl-8">
          <Eyebrow className="text-gold">{eyebrow}</Eyebrow>
          <h1 className="headline-display mt-5 text-[2.5rem] text-white sm:text-[3.25rem] lg:text-[3.75rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-6 max-w-2xl text-[1.0625rem] font-light leading-[1.8] text-white/60">
              {description}
            </p>
          )}
        </div>
      </Container>
      <div className="absolute inset-x-0 bottom-0 gold-rule opacity-25" aria-hidden="true" />
    </section>
  );
}
