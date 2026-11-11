import { Container } from '@/components/ui/container';
import { highlights } from '@/lib/data/content';

/**
 * Capability band directly under the hero: what RIVET COMPANY supplies and
 * does, in four short statements (static, readable without JavaScript).
 */
export function Highlights() {
  return (
    // Hidden on phones (below md); shown on tablet and desktop.
    <section
      aria-label="What RIVET COMPANY provides"
      className="hidden border-b border-border bg-canvas md:block"
    >
      <Container>
        <dl className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {highlights.map((h) => (
            <div key={h.title} className="flex flex-col py-6 sm:px-2 sm:py-8 lg:px-6">
              <dt className="text-md font-semibold leading-snug text-navy">{h.title}</dt>
              <dd className="mt-1.5 text-sm text-muted">{h.detail}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
