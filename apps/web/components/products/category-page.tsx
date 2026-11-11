import Link from 'next/link';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { ScrollNav } from '@/components/ui/scroll-nav';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { FaqSection } from '@/components/seo/faq-section';
import { ProductGroupJsonLd } from '@/components/seo/json-ld';
import { RivetImage } from '@/components/ui/rivet-image';
import { ElevatorSolutions } from '@/components/products/elevator-solutions';
import { ProductGallery } from '@/components/products/gallery';
import { ProductCard, ProductEmptyState } from '@/components/products/category-group';
import type { Category, Product, Service } from '@/lib/api';
import { getCategoryAncestors, parseFaqs } from '@/lib/seo';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button-variants';
import { RequestQuotationButton } from '@/components/quotation/request-quotation-button';
import { matchProductInterest } from '@/lib/product-interest';
import { relatedServices as findRelatedServices } from '@/lib/related-services';

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
  const ancestors = getCategoryAncestors(category.parent);
  // Most specific first: this category, then its ancestors.
  const lineage = [category.name, ...ancestors.map((a) => a.name).reverse()];
  const relatedServices = findRelatedServices(services, lineage);
  const productInterest = matchProductInterest(lineage);
  const hasChildren = Boolean(category.children?.length);
  const rootCategories = allCategories.filter((c) => !c.parentId);
  // Gallery: every category image (cover first); falls back to the single cover.
  const gallery = category.images?.length
    ? category.images
    : category.image
      ? [category.image]
      : [];

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

      <section className="border-b border-border bg-bg pt-28 pb-12 md:pt-32 md:pb-16">
        <Container>
          <Breadcrumbs
            items={[
              { name: 'Home', path: '/' },
              { name: 'Products', path: '/products' },
              ...ancestors,
              { name: category.name, path: `/products/${category.slug}` },
            ]}
          />

          {/* Department filter */}
          {rootCategories.length > 0 && (
            <ScrollNav
              aria-label="Departments"
              className="-mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
            >
              <Link
                href="/products"
                className="shrink-0 whitespace-nowrap rounded-[6px] border px-4 py-2 text-[0.875rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 border-border bg-canvas text-ink hover:border-navy hover:text-navy dark:bg-transparent dark:hover:border-gold dark:hover:text-gold"
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
                      'shrink-0 whitespace-nowrap rounded-[6px] border px-4 py-2 text-[0.875rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
                      isActive
                        ? 'border-navy bg-navy text-white dark:border-gold dark:bg-gold dark:text-[#002f54]'
                        : 'border-border bg-canvas text-ink hover:border-navy hover:text-navy dark:bg-transparent dark:hover:border-gold dark:hover:text-gold',
                    )}
                  >
                    {c.name}
                  </Link>
                );
              })}
            </ScrollNav>
          )}

          <div className="mt-10 grid items-center gap-10 lg:mt-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div>
              <Eyebrow>
                {ancestors.length > 0
                  ? `Product category · ${ancestors.map((a) => a.name).join(' · ')}`
                  : 'Product category'}
              </Eyebrow>
              <h1 className="headline-display mt-3 text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem]">
                {category.name}
              </h1>
              <p className="mt-4 max-w-xl text-[1.125rem] leading-relaxed text-muted">
                {category.description ??
                  `${category.name} from RIVET COMPANY for commercial and residential projects in Ethiopia. Browse the range or request a quotation.`}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <RequestQuotationButton productInterest={productInterest} />
                <Link
                  href="/services"
                  className={buttonVariants({ variant: 'outline', size: 'lg' })}
                >
                  Our services
                </Link>
              </div>
            </div>
            {gallery.length > 1 ? (
              <ProductGallery
                name={category.name}
                aspectClassName="aspect-[4/3] sm:aspect-[16/11]"
                sizes="(max-width: 1024px) 100vw, 45vw"
                images={gallery.map((url, i) => ({
                  id: `${category.id}-${i}`,
                  url,
                  alt: `${category.name} supplied by RIVET COMPANY in Ethiopia — photo ${i + 1}`,
                  publicId: null,
                  order: i,
                }))}
              />
            ) : category.image ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-[8px] border border-border bg-surface sm:aspect-[16/11]">
                <RivetImage
                  src={category.image}
                  alt={`${category.name} supplied by RIVET COMPANY in Ethiopia`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      {hasChildren ? (
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
              ? 'From passenger lifts for apartments to freight and service elevators, RIVET COMPANY supplies and installs elevator solutions for buildings of every size in Ethiopia.'
              : `Explore the complete ${category.name.toLowerCase()} range from RIVET COMPANY.`)
          }
        />
      ) : null}

      {/* A parent category with no products of its own is browsed through its
          ranges above; an "empty" notice here would contradict that grid. */}
      {(products.length > 0 || !hasChildren) && (
      <Section>
        <Container>
          <Eyebrow>Catalog</Eyebrow>
          <h2 className="headline-display mt-3 text-[2rem] sm:text-[2.25rem]">
            {products.length > 0
              ? `${category.name} products`
              : `Products in ${category.name}`}
          </h2>
          {products.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} categoryName={category.name} />
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <ProductEmptyState categoryName={category.name} productInterest={productInterest} />
            </div>
          )}
        </Container>
      </Section>
      )}

      {relatedServices.length > 0 && (
        <Section className="bg-surface">
          <Container>
            <Eyebrow>Support</Eyebrow>
            <h2 className="headline-display mt-3 text-[2rem] sm:text-[2.25rem]">Relevant services</h2>
            <ul className="mt-8 grid gap-5 md:grid-cols-3">
              {relatedServices.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="luxury-card group block h-full rounded-[8px] bg-canvas p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                  >
                    <h3 className="text-[1.125rem] group-hover:underline group-hover:underline-offset-4">{s.title}</h3>
                    <p className="mt-2 line-clamp-3 text-[0.9375rem] leading-relaxed text-muted">
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
