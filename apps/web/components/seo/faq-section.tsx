import { Container, Eyebrow, Section } from '@/components/ui/container';
import { FAQPageJsonLd } from '@/components/seo/json-ld';
import type { FaqItem } from '@/lib/seo';

export function FaqSection({
  faqs,
  title = 'Frequently asked questions',
  eyebrow = 'FAQ',
}: {
  faqs: FaqItem[];
  title?: string;
  eyebrow?: string;
}) {
  if (!faqs.length) return null;

  return (
    <>
      <FAQPageJsonLd faqs={faqs} />
      <Section className="bg-surface">
        <Container>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-3 max-w-2xl text-[1.75rem] sm:text-[2rem]">{title}</h2>
          <dl className="mt-10 max-w-3xl space-y-8">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <dt>
                  <h3 className="text-[1.0625rem] font-medium text-ink">{faq.question}</h3>
                </dt>
                <dd className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>
    </>
  );
}
