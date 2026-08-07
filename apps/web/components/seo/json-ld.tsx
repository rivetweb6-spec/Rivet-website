import { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION, LOGO_URL } from '@/lib/seo';
import type { FaqItem } from '@/lib/seo';

type JsonLdProps = { data: Record<string, unknown> | Record<string, unknown>[] };

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd({
  phone,
  email,
  address,
  sameAs = [],
}: {
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  sameAs?: (string | null | undefined)[];
}) {
  const socials = sameAs.filter((s): s is string => Boolean(s));

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        logo: LOGO_URL,
        ...(phone ? { telephone: phone } : {}),
        ...(email ? { email } : {}),
        ...(address
          ? {
              address: {
                '@type': 'PostalAddress',
                streetAddress: address,
                addressCountry: 'ET',
              },
            }
          : {}),
        ...(socials.length ? { sameAs: socials } : {}),
      }}
    />
  );
}

export function LocalBusinessJsonLd({
  phone,
  email,
  address,
  latitude,
  longitude,
  sameAs = [],
}: {
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  sameAs?: (string | null | undefined)[];
}) {
  const socials = sameAs.filter((s): s is string => Boolean(s));

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: SITE_NAME,
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        logo: LOGO_URL,
        image: LOGO_URL,
        ...(phone ? { telephone: phone } : {}),
        ...(email ? { email } : {}),
        ...(address
          ? {
              address: {
                '@type': 'PostalAddress',
                streetAddress: address,
                addressLocality: 'Addis Ababa',
                addressCountry: 'ET',
              },
            }
          : {}),
        ...(latitude != null && longitude != null
          ? {
              geo: {
                '@type': 'GeoCoordinates',
                latitude,
                longitude,
              },
            }
          : {}),
        ...(socials.length ? { sameAs: socials } : {}),
        areaServed: {
          '@type': 'Country',
          name: 'Ethiopia',
        },
      }}
    />
  );
}

export function ProductJsonLd({
  name,
  description,
  slug,
  image,
  images,
  brand,
  category,
  sku,
  productId,
  specs,
}: {
  name: string;
  description?: string | null;
  slug: string;
  image?: string | null;
  images?: string[];
  brand?: string | null;
  category?: string | null;
  sku?: string | null;
  productId?: string | null;
  specs?: { label: string; value: string }[] | null;
}) {
  const imageList = images?.length ? images : image ? [image] : undefined;
  const additionalProperty =
    Array.isArray(specs) && specs.length
      ? specs.map((s) => ({
          '@type': 'PropertyValue',
          name: s.label,
          value: s.value,
        }))
      : undefined;

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        description: description ?? undefined,
        url: `${SITE_URL}/products/${slug}`,
        image: imageList,
        brand: brand ? { '@type': 'Brand', name: brand } : undefined,
        category: category ?? undefined,
        sku: sku ?? undefined,
        productID: productId ?? undefined,
        additionalProperty,
        // Offer without invented price or availability — quotation-based sales.
        offers: {
          '@type': 'Offer',
          url: `${SITE_URL}/products/${slug}`,
          seller: { '@type': 'Organization', name: SITE_NAME },
        },
      }}
    />
  );
}

export function ProductGroupJsonLd({
  name,
  description,
  slug,
  image,
  products,
}: {
  name: string;
  description?: string | null;
  slug: string;
  image?: string | null;
  products: { name: string; slug: string; image?: string | null }[];
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'ProductGroup',
        name,
        description: description ?? undefined,
        url: `${SITE_URL}/products/${slug}`,
        image: image ? [image] : undefined,
        hasVariant: products.map((p) => ({
          '@type': 'Product',
          name: p.name,
          url: `${SITE_URL}/products/${p.slug}`,
          image: p.image ? [p.image] : undefined,
        })),
      }}
    />
  );
}

export function FAQPageJsonLd({ faqs }: { faqs: FaqItem[] }) {
  if (!faqs.length) return null;
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }}
    />
  );
}

export function ArticleJsonLd({
  title,
  description,
  slug,
  image,
  publishedAt,
  category,
}: {
  title: string;
  description?: string | null;
  slug: string;
  image?: string | null;
  publishedAt?: string | null;
  category?: string | null;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: title,
        description: description ?? undefined,
        image: image ? [image] : undefined,
        datePublished: publishedAt ?? undefined,
        author: { '@type': 'Organization', name: SITE_NAME },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: { '@type': 'ImageObject', url: LOGO_URL },
        },
        mainEntityOfPage: `${SITE_URL}/news/${slug}`,
        articleSection: category ?? undefined,
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          item: `${SITE_URL}${item.path}`,
        })),
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: { '@type': 'ImageObject', url: LOGO_URL },
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  );
}
