import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { ProductGallery } from '@/components/products/gallery';
import { CategoryPageView } from '@/components/products/category-page';
import { RequestQuotationButton } from '@/components/quotation/request-quotation-button';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { ProductJsonLd } from '@/components/seo/json-ld';
import { ProductCard } from '@/components/products/category-group';
import { buttonVariants } from '@/components/ui/button-variants';
import { productInterests } from '@/lib/data/content';
import { api } from '@/lib/api';
import {
  buildProductAltText,
  categoryMetadata,
  getCategoryAncestors,
  notFoundMetadata,
  productMetadata,
} from '@/lib/seo';

type Params = Promise<{ slug: string }>;

export const revalidate = 60;
/** Allow CMS slugs added after build (empty generateStaticParams at Vercel build is OK). */
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const [{ categories }, first] = await Promise.all([
      api.categories.list(),
      api.products.list({ pageSize: 100, page: 1 }),
    ]);
    const products = [...first.products];
    for (let page = 2; page <= first.pagination.pages; page += 1) {
      const next = await api.products.list({ pageSize: 100, page });
      products.push(...next.products);
    }
    const slugs = new Set([
      ...products.map((p) => p.slug),
      ...categories.map((c) => c.slug),
    ]);
    return [...slugs].map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { category } = await api.categories.bySlug(slug);
    return categoryMetadata(category);
  } catch {
    /* not a category */
  }
  try {
    const { product } = await api.products.bySlug(slug);
    return productMetadata(product);
  } catch {
    return notFoundMetadata('Product');
  }
}

export default async function ProductOrCategoryPage({ params }: { params: Params }) {
  const { slug } = await params;

  // Category-first resolver (shared /products/[slug] namespace). Fetch data
  // first so JSX is not returned from inside try/catch.
  let categoryPage: {
    category: Awaited<ReturnType<typeof api.categories.bySlug>>['category'];
    allCategories: Awaited<ReturnType<typeof api.categories.list>>['categories'];
    products: Awaited<ReturnType<typeof api.products.list>>['products'];
    services: Awaited<ReturnType<typeof api.services.list>>['services'];
  } | null = null;
  try {
    const [{ category }, { categories }, { products }, { services }] = await Promise.all([
      api.categories.bySlug(slug),
      api.categories.list(),
      api.products.list({ category: slug, pageSize: 48 }),
      api.services.list(),
    ]);
    categoryPage = { category, allCategories: categories, products, services };
  } catch {
    /* Not a category slug — resolve as a product instead. */
  }

  if (categoryPage) {
    return (
      <CategoryPageView
        category={categoryPage.category}
        allCategories={categoryPage.allCategories}
        products={categoryPage.products}
        services={categoryPage.services}
      />
    );
  }

  let data;
  try {
    data = await api.products.bySlug(slug);
  } catch {
    notFound();
  }

  const { product, related } = data;
  const specs = Array.isArray(product.specs) ? product.specs : [];
  const features = Array.isArray(product.features) ? product.features : [];
  const primaryImage = product.images[0]?.url ?? null;
  const candidateCategoryNames = [
    product.category?.name,
    ...getCategoryAncestors(product.category?.parent).map((a) => a.name).reverse(),
  ].filter(Boolean) as string[];

  const matchedInterest = candidateCategoryNames.find((catName) =>
    productInterests.some((interest) => interest.toLowerCase() === catName.toLowerCase()),
  );

  const productInterest =
    productInterests.find(
      (interest) => interest.toLowerCase() === matchedInterest?.toLowerCase(),
    ) ?? (product.category?.name ? 'Other' : undefined);

  let services: Awaited<ReturnType<typeof api.services.list>>['services'] = [];
  try {
    ({ services } = await api.services.list());
  } catch {
    /* optional */
  }
  const relatedServices = services.slice(0, 3);

  const galleryImages = product.images.map((img) => ({
    ...img,
    alt:
      img.alt ||
      buildProductAltText(product.name, product.category?.name, product.shortDescription),
  }));

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    ...getCategoryAncestors(product.category?.parent),
    ...(product.category
      ? [{ name: product.category.name, path: `/products/${product.category.slug}` }]
      : []),
    { name: product.name, path: `/products/${product.slug}` },
  ];

  return (
    <>
      <ProductJsonLd
        name={product.name}
        description={product.shortDescription}
        slug={product.slug}
        image={primaryImage}
        images={product.images.map((i) => i.url)}
        brand={product.brand}
        category={product.category?.name}
        productId={product.id}
        sku={product.slug}
        specs={specs}
      />

      <section className="border-b border-border bg-canvas pt-28 pb-16 md:pt-32 md:pb-20">
        <Container>
          <Breadcrumbs items={crumbs} />
          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
            <ProductGallery images={galleryImages} name={product.name} />

            <div>
              {product.category && (
                <Link
                  href={`/products/${product.category.slug}`}
                  className="inline-block rounded-[4px] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                >
                  <Eyebrow>
                    {[
                      ...getCategoryAncestors(product.category.parent).map((a) => a.name),
                      product.category.name,
                    ].join(' · ')}
                  </Eyebrow>
                </Link>
              )}
              <h1 className="headline-display mt-3 text-[2rem] sm:text-[2.5rem] lg:text-[2.75rem]">{product.name}</h1>
              {product.shortDescription && (
                <p className="mt-4 text-[1.125rem] leading-relaxed text-muted">
                  {product.shortDescription}
                </p>
              )}

              {(product.brand || product.countryOfOrigin) && (
                <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3 border-y border-border py-4 text-[0.9375rem]">
                  {product.brand && (
                    <div>
                      <dt className="text-[0.8125rem] text-muted">Brand</dt>
                      <dd className="mt-0.5 font-semibold text-ink">{product.brand}</dd>
                    </div>
                  )}
                  {product.countryOfOrigin && (
                    <div>
                      <dt className="text-[0.8125rem] text-muted">Origin</dt>
                      <dd className="mt-0.5 font-semibold text-ink">{product.countryOfOrigin}</dd>
                    </div>
                  )}
                </dl>
              )}

              {features.length > 0 && (
                <ul className="mt-8 space-y-3">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[0.9375rem] text-ink">
                      <span
                        className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[4px] bg-bg text-navy"
                        aria-hidden="true"
                      >
                        <Check size={13} strokeWidth={2.5} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-10 flex flex-wrap gap-3">
                <RequestQuotationButton
                  productInterest={productInterest}
                  productId={product.id}
                  productName={product.name}
                  productSlug={product.slug}
                  productImage={primaryImage ?? undefined}
                />
                <Link
                  href="/request-quotation"
                  className={buttonVariants({ variant: 'outline', size: 'lg' })}
                >
                  Open full quotation form
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center gap-1.5 rounded-[6px] px-2 text-[0.9375rem] font-semibold text-navy underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  Contact us
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {(product.description || specs.length > 0) && (
        <Section>
          <Container>
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              {product.description && (
                <div>
                  <h2 className="headline-display text-[1.5rem] sm:text-[1.75rem]">Description</h2>
                  <p className="mt-4 whitespace-pre-line text-[1.0625rem] leading-relaxed text-muted">{product.description}</p>
                </div>
              )}
              {specs.length > 0 && (
                <div>
                  <h2 className="headline-display text-[1.5rem] sm:text-[1.75rem]">Specifications</h2>
                  <dl className="mt-4 divide-y divide-divider border-y border-divider">
                    {specs.map((s) => (
                      <div
                        key={s.label}
                        className="flex justify-between gap-6 py-3.5 text-[0.9375rem]"
                      >
                        <dt className="text-muted">{s.label}</dt>
                        <dd className="text-right font-medium text-ink">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </Container>
        </Section>
      )}

      {relatedServices.length > 0 && (
        <Section className="bg-surface">
          <Container>
            <Eyebrow>Services</Eyebrow>
            <h2 className="headline-display mt-3 text-[2rem] sm:text-[2.25rem]">Relevant services</h2>
            <ul className="mt-8 grid gap-5 md:grid-cols-3">
              {relatedServices.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="luxury-card group block h-full rounded-[8px] bg-canvas p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                  >
                    <h3 className="text-[1.125rem] group-hover:underline group-hover:underline-offset-4">{s.title}</h3>
                    <p className="mt-2 line-clamp-3 text-[0.9375rem] leading-relaxed text-muted">{s.narrative}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      {related.length > 0 && (
        <Section>
          <Container>
            <Eyebrow>Continue exploring</Eyebrow>
            <h2 className="headline-display mt-3 text-[2rem] sm:text-[2.25rem]">Related products</h2>
            {product.category && (
              <p className="mt-2 text-muted">
                More from{' '}
                <Link
                  href={`/products/${product.category.slug}`}
                  className="font-semibold text-navy underline underline-offset-4 hover:no-underline"
                >
                  {product.category.name}
                </Link>
              </p>
            )}
            <div className="mt-10 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:gap-6">
              {related.slice(0, 3).map((p) => (
                <ProductCard key={p.id} product={p} categoryName={product.category?.name} />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
