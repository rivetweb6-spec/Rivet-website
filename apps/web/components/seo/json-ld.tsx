import { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION, LOGO_URL } from '@/lib/seo';
import type { FaqItem } from '@/lib/seo';

type JsonLdProps = { data: Record<string, unknown> | Record<string, unknown>[] };

/**
 * JSON.stringify does not escape characters that are significant inside a
 * <script> block, so a title containing "</script>" would close the tag and let
 * the rest of the field run as markup. Escaping these as JSON unicode escapes
 * keeps the payload byte-identical to parsers while making tag breakout
 * impossible. U+2028/U+2029 are escaped because they are literal line
 * terminators in JavaScript but legal inside JSON strings.
 */
function serializeJsonLd(data: JsonLdProps['data']): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
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

export function ServiceJsonLd({
  title,
  description,
  slug,
  image,
}: {
  title: string;
  description?: string | null;
  slug: string;
  image?: string | null;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: title,
        description: description ?? undefined,
        url: `${SITE_URL}/services/${slug}`,
        image: image ? [image] : undefined,
        provider: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
          logo: LOGO_URL,
        },
        areaServed: {
          '@type': 'Country',
          name: 'Ethiopia',
        },
      }}
    />
  );
}

export function AboutPageJsonLd({
  description,
}: {
  description?: string | null;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: `About ${SITE_NAME}`,
        url: `${SITE_URL}/company`,
        description: description ?? DEFAULT_DESCRIPTION,
        mainEntity: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
        },
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
  updatedAt,
  category,
}: {
  title: string;
  description?: string | null;
  slug: string;
  image?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
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
        dateModified: updatedAt ?? publishedAt ?? undefined,
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

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  'full-time': 'FULL_TIME',
  'part-time': 'PART_TIME',
  contract: 'CONTRACTOR',
  contractor: 'CONTRACTOR',
  temporary: 'TEMPORARY',
  internship: 'INTERN',
  intern: 'INTERN',
};

export function JobPostingJsonLd({
  title,
  description,
  slug,
  datePosted,
  validThrough,
  employmentType,
  location,
}: {
  title: string;
  description?: string | null;
  slug: string;
  datePosted?: string | null;
  validThrough?: string | null;
  employmentType?: string | null;
  location?: string | null;
}) {
  const mappedType = employmentType
    ? EMPLOYMENT_TYPE_MAP[employmentType.toLowerCase()]
    : undefined;

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title,
        description: description ?? undefined,
        datePosted: datePosted ?? undefined,
        validThrough: validThrough ?? undefined,
        employmentType: mappedType,
        hiringOrganization: {
          '@type': 'Organization',
          name: SITE_NAME,
          sameAs: SITE_URL,
          logo: LOGO_URL,
        },
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: location || 'Addis Ababa',
            addressCountry: 'ET',
          },
        },
        url: `${SITE_URL}/careers/${slug}`,
        directApply: true,
      }}
    />
  );
}
