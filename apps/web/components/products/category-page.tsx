import Link from 'next/link';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { FaqSection } from '@/components/seo/faq-section';
import { ProductGroupJsonLd } from '@/components/seo/json-ld';
import { RivetImage } from '@/components/ui/rivet-image';
import type { Category, Product, Service } from '@/lib/api';
import { assets } from '@/lib/assets';
import { buildProductAltText, parseFaqs } from '@/lib/seo';

export function CategoryPageView({
  category,
  products,
  services,
}: {
  category: Category;
  products: Product[];
  services: Service[];
}) {
  const faqs = parseFaqs(category.faqs);
  const relatedServices = services.slice(0, 3);

  return (
    <>
      <ProductGroupJsonLd
        name={category.name}
        description={category.description}
        slug={category.slug}
        image={category.image}
        products={products.map((p) => ({
          name: p.name,
          slug: p.slug,
          image: p.images[0]?.url ?? null,
        }))}
      />

      <section className="bg-bg pt-28 pb-16 md:pt-32 md:pb-20">
        <Container>
          <Breadcrumbs
            items={[
              { name: 'Home', path: '/' },
              { name: 'Products', path: '/products' },
              { name: category.name, path: `/products/${category.slug}` },
            ]}
          />

          <div className="mt-10 grid items-center gap-10 lg:mt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div>
              <Eyebrow>Product category</Eyebrow>
              <h1 className="mt-3 text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem]">
                {category.name}
              </h1>
              <p className="mt-4 max-w-xl text-[1.125rem] leading-relaxed text-muted">
                {category.description ??
                  `Explore premium ${category.name.toLowerCase()} from Rivet — quality products for commercial and residential projects in Ethiopia.`}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/request-quotation"
                  className="inline-flex h-14 items-center justify-center rounded-[12px] bg-gold px-8 text-[1rem] font-medium text-navy shadow-[var(--shadow-md)] transition-all hover:brightness-110"
                >
                  Request a quotation
                </Link>
                <Link
                  href="/services"
                  className="inline-flex h-14 items-center justify-center rounded-[12px] border border-navy/20 px-8 text-[1rem] font-medium text-navy transition-all hover:border-gold hover:text-gold"
                >
                  Related services
                </Link>
              </div>
            </div>
            {category.image && (
              <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-surface shadow-[var(--shadow-lg)] sm:aspect-[16/11]">
                <RivetImage
                  src={category.image}
                  alt={`Premium ${category.name} supplied by Rivet in Ethiopia`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </Container>
      </section>

      <Section>
        <Container>
          <Eyebrow>Catalog</Eyebrow>
          <h2 className="mt-3 text-[2rem]">
            {products.length > 0
              ? `${category.name} products`
              : `No published products in ${category.name} yet`}
          </h2>
          {products.length > 0 && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => {
                const image = p.images[0]?.url ?? assets.products.p1;
                const alt =
                  p.images[0]?.alt ||
                  buildProductAltText(p.name, category.name, p.shortDescription);
                return (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    className="group overflow-hidden rounded-[16px] bg-surface shadow-[var(--shadow-sm)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <RivetImage
                        src={image}
                        alt={alt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-[1.0625rem]">{p.name}</h3>
                      {p.shortDescription && (
                        <p className="mt-2 line-clamp-2 text-[0.875rem] text-muted">
                          {p.shortDescription}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Container>
      </Section>

      {relatedServices.length > 0 && (
        <Section className="bg-surface">
          <Container>
            <Eyebrow>Support</Eyebrow>
            <h2 className="mt-3 text-[2rem]">Relevant services</h2>
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {relatedServices.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="block rounded-[16px] border border-border bg-bg p-6 transition-colors hover:border-gold/40"
                  >
                    <h3 className="text-[1.125rem]">{s.title}</h3>
                    <p className="mt-2 line-clamp-3 text-[0.875rem] text-muted">{s.narrative}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      <FaqSection
        faqs={faqs}
        title={`About ${category.name.toLowerCase()} from Rivet`}
        eyebrow="Category FAQ"
      />
    </>
  );
}
