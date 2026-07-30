import { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION } from '@/lib/seo';

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
        logo: `${SITE_URL}/icon.svg`,
        ...(phone ? { telephone: phone } : {}),
        ...(email ? { email } : {}),
        ...(address
          ? {
              address: {
                '@type': 'PostalAddress',
                streetAddress: address,
              },
            }
          : {}),
        ...(socials.length ? { sameAs: socials } : {}),
      }}
    />
  );
}

export function ProductJsonLd({
  name,
  description,
  slug,
  image,
  brand,
  category,
}: {
  name: string;
  description?: string | null;
  slug: string;
  image?: string | null;
  brand?: string | null;
  category?: string | null;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        description: description ?? undefined,
        url: `${SITE_URL}/products/${slug}`,
        image: image ? [image] : undefined,
        brand: brand ? { '@type': 'Brand', name: brand } : undefined,
        category: category ?? undefined,
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}/products/${slug}`,
          seller: { '@type': 'Organization', name: SITE_NAME },
        },
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
        '@type': 'Article',
        headline: title,
        description: description ?? undefined,
        image: image ? [image] : undefined,
        datePublished: publishedAt ?? undefined,
        author: { '@type': 'Organization', name: SITE_NAME },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.svg` },
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
