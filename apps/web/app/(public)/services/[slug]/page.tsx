import Link from 'next/link';
import type { Metadata } from 'next';
import * as Icons from 'lucide-react';
import { notFound } from 'next/navigation';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { FaqSection } from '@/components/seo/faq-section';
import { RequestQuotationButton } from '@/components/quotation/request-quotation-button';
import { RivetImage } from '@/components/ui/rivet-image';
import { api } from '@/lib/api';
import { parseFaqs, serviceMetadata } from '@/lib/seo';

type Params = Promise<{ slug: string }>;

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const { services } = await api.services.list();
    return services.map((s) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  try {
    const { service } = await api.services.bySlug((await params).slug);
    return serviceMetadata(service);
  } catch {
    return { title: 'Service' };
  }
}

export default async function ServiceDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  let service;
  try {
    ({ service } = await api.services.bySlug(slug));
  } catch {
    notFound();
  }

  const faqs = parseFaqs(service.faqs);
  const Icon = (Icons[service.icon as keyof typeof Icons] ?? Icons.Wrench) as Icons.LucideIcon;

  return (
    <>
      <section className="bg-bg pt-28 pb-6 md:pt-32">
        <Container>
          <Breadcrumbs
            items={[
              { name: 'Home', path: '/' },
              { name: 'Services', path: '/services' },
              { name: service.title, path: `/services/${service.slug}` },
            ]}
          />
        </Container>
      </section>

      <Section className="bg-bg pt-6">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-start">
            <div>
              <span className="grid h-14 w-14 place-items-center rounded-[12px] bg-navy/5 text-navy">
                <Icon size={26} strokeWidth={1.5} />
              </span>
              <Eyebrow className="mt-6">Service</Eyebrow>
              <h1 className="mt-3 text-[2.25rem] sm:text-[2.75rem]">{service.title}</h1>
              <p className="mt-5 text-[1.125rem] leading-relaxed text-muted">{service.narrative}</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <RequestQuotationButton />
                <Link
                  href="/request-quotation"
                  className="inline-flex h-14 items-center justify-center rounded-[12px] border border-navy/20 px-8 text-[1rem] font-medium text-navy transition-all hover:border-gold hover:text-gold"
                >
                  Quotation page
                </Link>
                <Link
                  href="/products"
                  className="inline-flex h-14 items-center justify-center rounded-[12px] border border-navy/20 px-8 text-[1rem] font-medium text-navy transition-all hover:border-gold hover:text-gold"
                >
                  Browse products
                </Link>
              </div>
            </div>
            {service.image && (
              <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-surface shadow-[var(--shadow-lg)]">
                <RivetImage
                  src={service.image}
                  alt={`${service.title} — Rivet services in Ethiopia`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </Container>
      </Section>

      <FaqSection
        faqs={faqs}
        title={`Questions about ${service.title.toLowerCase()}`}
        eyebrow="Service FAQ"
      />
    </>
  );
}
