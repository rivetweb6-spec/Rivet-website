import { Container } from '@/components/ui/container';
import { highlights } from '@/lib/data/content';

/**
 * Capability band directly under the hero: what RIVET COMPANY supplies and
 * does, in four short statements (static, readable without JavaScript).
 */
export function Highlights() {
  return (
    <section aria-label="What RIVET COMPANY provides" className="border-b border-border bg-canvas">
      <Container>
        <dl className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {highlights.map((h) => (
            <div key={h.title} className="flex flex-col py-6 sm:px-2 sm:py-8 lg:px-6">
              <dt className="text-[1.0625rem] font-semibold leading-snug text-navy">{h.title}</dt>
              <dd className="mt-1.5 text-[0.9375rem] text-muted">{h.detail}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
