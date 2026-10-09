import Link from 'next/link';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { FaqSection } from '@/components/seo/faq-section';
import { ProductGroupJsonLd } from '@/components/seo/json-ld';
import { RivetImage } from '@/components/ui/rivet-image';
import { ElevatorSolutions } from '@/components/products/elevator-solutions';
import { ProductCard, ProductEmptyState } from '@/components/products/category-group';
import type { Category, Product, Service } from '@/lib/api';
import { getCategoryAncestors, parseFaqs } from '@/lib/seo';
import { cn } from '@/lib/utils';

export function CategoryPageView({
  category,
  allCategories = [],
  products,
  services,
}: {
  category: Category;
  allCategories?: Category[];
  products: Product[];
  services: Service[];
}) {
  const faqs = parseFaqs(category.faqs);
  const relatedServices = services.slice(0, 3);
  const ancestors = getCategoryAncestors(category.parent);
  const rootCategories = allCategories.filter((c) => !c.parentId);

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
          {/* Category filter bar */}
          {rootCategories.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              <Link
                href="/products"
                className="rounded-full border border-border bg-surface px-4 py-2 text-[0.8125rem] font-medium text-ink transition-colors hover:border-gold hover:text-gold"
              >
                All
              </Link>
              {rootCategories.map((c) => {
                const isActive =
                  c.slug === category.slug ||
                  ancestors.some((a) => a.path === `/products/${c.slug}`);
                return (
                  <Link
                    key={c.slug}
                    href={`/products/${c.slug}`}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'rounded-full border px-4 py-2 text-[0.8125rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
                      isActive
                        ? 'border-navy bg-navy text-white'
                        : 'border-border bg-surface text-ink hover:border-gold hover:text-gold',
                    )}
                  >
                    {c.name}
                  </Link>
                );
              })}
            </div>
          )}

          <Breadcrumbs
            items={[
              { name: 'Home', path: '/' },
              { name: 'Products', path: '/products' },
              ...ancestors,
              { name: category.name, path: `/products/${category.slug}` },
            ]}
          />

          <div className="mt-10 grid items-center gap-10 lg:mt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div>
              <Eyebrow>
                {ancestors.length > 0
                  ? `Product category · ${ancestors.map((a) => a.name).join(' · ')}`
                  : 'Product category'}
              </Eyebrow>
              <h1 className="mt-3 text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem]">
                {category.name}
              </h1>
              <p className="mt-4 max-w-xl text-[1.125rem] leading-relaxed text-muted">
                {category.description ??
                  `Explore premium ${category.name.toLowerCase()} from Rivet — quality products for commercial and residential projects in Ethiopia.`}
              </p>

              {category.children && category.children.length > 0 && (
                <div className="mt-6">
                  <p className="text-[0.75rem] uppercase tracking-wider text-muted font-medium mb-2.5">
                    Subcategories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {category.children.map((sub) => (
                      <Link
                        key={sub.slug}
                        href={`/products/${sub.slug}`}
                        className="inline-flex items-center rounded-full border border-navy/15 bg-pearl/60 px-3.5 py-1.5 text-[0.8125rem] font-medium text-navy transition-all hover:border-gold hover:bg-gold/10 hover:text-navy"
                      >
                        {sub.name}
                        {sub._count?.products !== undefined && (
                          <span className="ml-1.5 rounded-full bg-navy/10 px-1.5 py-0.2 text-[0.6875rem] text-muted font-normal">
                            {sub._count.products}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

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

      {category.children && category.children.length > 0 ? (
        <ElevatorSolutions
          category={category}
          eyebrow={
            category.slug.startsWith('elevator')
              ? 'Elevator Solutions'
              : `${category.name} Solutions`
          }
          title={
            category.slug === 'elevators'
              ? 'Explore our elevator range'
              : `Explore our ${category.name.toLowerCase()} range`
          }
          description={
            category.description ??
            (category.slug.startsWith('elevator')
              ? 'From residential passenger lifts to industrial freight systems, Rivet supplies and installs a complete range of elevator solutions for every project scale in Ethiopia.'
              : `Explore the complete ${category.name.toLowerCase()} range from Rivet.`)
          }
        />
      ) : null}

      <Section>
        <Container>
          <Eyebrow>Catalog</Eyebrow>
          <h2 className="mt-3 text-[2rem]">
            {products.length > 0
              ? `${category.name} products`
              : `Products in ${category.name}`}
          </h2>
          {products.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} categoryName={category.name} />
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <ProductEmptyState categoryName={category.name} />
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
                    <p className="mt-2 line-clamp-3 text-[0.875rem] text-muted">
                      {s.narrative}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      {faqs.length > 0 && <FaqSection faqs={faqs} title={`${category.name} FAQs`} />}
    </>
  );
}
