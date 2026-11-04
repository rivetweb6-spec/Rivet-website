import { Container } from '@/components/ui/container';
import { stats } from '@/lib/data/content';

/**
 * Key figures band directly under the hero — static numbers (readable by
 * crawlers and without JavaScript), separated by hairlines.
 */
export function Stats() {
  return (
    <section aria-label="RIVET in numbers" className="border-b border-border bg-canvas">
      <Container>
        <dl className="grid grid-cols-2 divide-border lg:grid-cols-4 lg:divide-x">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col px-2 py-8 text-center md:py-10 lg:px-6">
              <dt className="order-2 mt-2 text-[0.9375rem] text-muted">{s.label}</dt>
              <dd className="headline-display order-1 text-[2.25rem] text-navy md:text-[2.75rem]">
                {s.value.toLocaleString('en-US')}
                <span className="text-gold-ink">{s.suffix}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
