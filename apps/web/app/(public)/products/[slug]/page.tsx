import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Check } from 'lucide-react';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { ProductGallery } from '@/components/products/gallery';
import { CategoryPageView } from '@/components/products/category-page';
import { RequestQuotationButton } from '@/components/quotation/request-quotation-button';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { ProductJsonLd } from '@/components/seo/json-ld';
import { RivetImage } from '@/components/ui/rivet-image';
import { productInterests } from '@/lib/data/content';
import { api } from '@/lib/api';
import { assets } from '@/lib/assets';
import { buildProductAltText, categoryMetadata, notFoundMetadata, productMetadata } from '@/lib/seo';

type Params = Promise<{ slug: string }>;

export const revalidate = 60;

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
    products: Awaited<ReturnType<typeof api.products.list>>['products'];
    services: Awaited<ReturnType<typeof api.services.list>>['services'];
  } | null = null;
  try {
    const { category } = await api.categories.bySlug(slug);
    const [{ products }, { services }] = await Promise.all([
      api.products.list({ category: category.slug, pageSize: 48 }),
      api.services.list(),
    ]);
    categoryPage = { category, products, services };
  } catch {
    /* Not a category slug — resolve as a product instead. */
  }

  if (categoryPage) {
    return (
      <CategoryPageView
        category={categoryPage.category}
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
  const productInterest =
    productInterests.find(
      (interest) => interest.toLowerCase() === product.category?.name?.toLowerCase(),
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

      <section className="bg-bg pt-28 pb-6 md:pt-32">
        <Container>
          <Breadcrumbs items={crumbs} />
        </Container>
      </section>

      <Section className="bg-bg pt-6">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <ProductGallery images={galleryImages} name={product.name} />

            <div>
              {product.category && (
                <Link
                  href={`/products/${product.category.slug}`}
                  className="inline-block transition-colors hover:text-gold"
                >
                  <Eyebrow>{product.category.name}</Eyebrow>
                </Link>
              )}
              <h1 className="mt-3 text-[2.25rem] sm:text-[2.75rem]">{product.name}</h1>
              {product.shortDescription && (
                <p className="mt-4 text-[1.125rem] leading-relaxed text-muted">
                  {product.shortDescription}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-[0.9375rem]">
                {product.brand && (
                  <p>
                    <span className="text-muted">Brand</span>
                    <span className="ml-2 font-medium text-ink">{product.brand}</span>
                  </p>
                )}
                {product.countryOfOrigin && (
                  <p>
                    <span className="text-muted">Origin</span>
                    <span className="ml-2 font-medium text-ink">{product.countryOfOrigin}</span>
                  </p>
                )}
              </div>

              {features.length > 0 && (
                <ul className="mt-8 space-y-3">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[0.9375rem]">
                      <span
                        className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold/15 text-gold"
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
                  className="inline-flex h-14 items-center justify-center rounded-[12px] border border-navy/20 px-8 text-[1rem] font-medium text-navy transition-all hover:border-gold hover:text-gold"
                >
                  Quotation page
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-14 items-center justify-center rounded-[12px] border border-navy/20 px-8 text-[1rem] font-medium text-navy transition-all hover:border-gold hover:text-gold"
                >
                  Contact us
                </Link>
              </div>
            </div>
          </div>

          {(product.description || specs.length > 0) && (
            <div className="mt-20 grid gap-12 border-t border-divider pt-16 lg:grid-cols-2">
              {product.description && (
                <div>
                  <h2 className="text-[1.75rem]">Description</h2>
                  <p className="mt-4 leading-relaxed text-muted">{product.description}</p>
                </div>
              )}
              {specs.length > 0 && (
                <div>
                  <h2 className="text-[1.75rem]">Specifications</h2>
                  <dl className="mt-4 divide-y divide-divider border-y border-divider">
                    {specs.map((s) => (
                      <div
                        key={s.label}
                        className="flex justify-between gap-6 py-3.5 text-[0.9375rem]"
                      >
                        <dt className="text-muted">{s.label}</dt>
                        <dd className="font-medium text-ink">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          )}
        </Container>
      </Section>

      {relatedServices.length > 0 && (
        <Section className="bg-surface">
          <Container>
            <Eyebrow>Services</Eyebrow>
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

      {related.length > 0 && (
        <Section>
          <Container>
            <Eyebrow>Continue exploring</Eyebrow>
            <h2 className="mt-3 text-[2rem]">Related products</h2>
            {product.category && (
              <p className="mt-2 text-muted">
                More from{' '}
                <Link
                  href={`/products/${product.category.slug}`}
                  className="text-navy underline-offset-2 hover:text-gold hover:underline"
                >
                  {product.category.name}
                </Link>
              </p>
            )}
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => {
                const image = p.images[0]?.url ?? assets.products.p1;
                const alt =
                  p.images[0]?.alt ||
                  buildProductAltText(p.name, product.category?.name, p.shortDescription);
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
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-[1.0625rem]">{p.name}</h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
