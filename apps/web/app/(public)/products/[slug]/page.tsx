import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Check } from 'lucide-react';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { ProductGallery } from '@/components/products/gallery';
import { DemoRequestButton } from '@/components/demo/demo-request-button';
import { BreadcrumbJsonLd, ProductJsonLd } from '@/components/seo/json-ld';
import { RivetImage } from '@/components/ui/rivet-image';
import { api } from '@/lib/api';
import { assets } from '@/lib/assets';
import { productMetadata } from '@/lib/seo';

type Params = Promise<{ slug: string }>;

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const { products } = await api.products.list({ pageSize: 100 });
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  try {
    const { product } = await api.products.bySlug((await params).slug);
    return productMetadata(product);
  } catch {
    return { title: 'Product' };
  }
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
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

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    ...(product.category
      ? [{ name: product.category.name, path: `/products?category=${product.category.slug}` }]
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
        brand={product.brand}
        category={product.category?.name}
      />
      <BreadcrumbJsonLd items={crumbs} />

      <section className="bg-bg pt-28 pb-6 md:pt-32">
        <Container>
          <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-muted">
            <ol className="flex flex-wrap items-center">
              <li>
                <Link href="/products" className="hover:text-gold focus-visible:text-gold">
                  Products
                </Link>
              </li>
              {product.category && (
                <li className="flex items-center">
                  <span className="mx-2" aria-hidden="true">
                    /
                  </span>
                  <Link
                    href={`/products?category=${product.category.slug}`}
                    className="hover:text-gold focus-visible:text-gold"
                  >
                    {product.category.name}
                  </Link>
                </li>
              )}
              <li className="flex items-center">
                <span className="mx-2" aria-hidden="true">
                  /
                </span>
                <span className="text-ink" aria-current="page">
                  {product.name}
                </span>
              </li>
            </ol>
          </nav>
        </Container>
      </section>

      <Section className="bg-bg pt-6">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <ProductGallery images={product.images} name={product.name} />

            <div>
              {product.category && <Eyebrow>{product.category.name}</Eyebrow>}
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
                <DemoRequestButton label="Inquire about this product" />
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
                      <div key={s.label} className="flex justify-between gap-6 py-3.5 text-[0.9375rem]">
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

      {related.length > 0 && (
        <Section>
          <Container>
            <Eyebrow>Continue exploring</Eyebrow>
            <h2 className="mt-3 text-[2rem]">Related products</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => {
                const image = p.images[0]?.url ?? assets.products.p1;
                return (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    className="group overflow-hidden rounded-[16px] bg-surface shadow-[var(--shadow-sm)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <RivetImage
                        src={image}
                        alt={p.name}
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
