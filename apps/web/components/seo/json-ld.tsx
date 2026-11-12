import {
  SITE_NAME,
  SITE_URL,
  SITE_ALTERNATE_NAMES,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  LOGO_URL,
  ORGANIZATION_ID,
  LOCAL_BUSINESS_ID,
  WEBSITE_ID,
} from '@/lib/seo';
import { isProfileUrl } from '@/lib/contact';
import { toAbsoluteMediaUrl } from '@/lib/media';

/** Structured-data images must be public absolute URLs (never a private upload host). */
const mediaUrl = (src: string) => toAbsoluteMediaUrl(src, SITE_URL);

/** What RIVET COMPANY supplies — helps search engines understand the business. */
const KNOWS_ABOUT = [
  'Elevators',
  'Passenger lifts',
  'Escalators',
  'Elevator installation',
  'Elevator maintenance',
  'Granite',
  'Doors',
  'Office furniture',
  'Sanitary goods',
  'Building materials',
];
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
  const socials = sameAs.filter(isProfileUrl);

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAMES,
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        logo: { '@type': 'ImageObject', url: LOGO_URL },
        image: DEFAULT_OG_IMAGE,
        knowsAbout: KNOWS_ABOUT,
        areaServed: { '@type': 'Country', name: 'Ethiopia' },
        ...(phone ? { telephone: phone } : {}),
        ...(email ? { email } : {}),
        ...(phone || email
          ? {
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'sales',
                areaServed: 'ET',
                ...(phone ? { telephone: phone } : {}),
                ...(email ? { email } : {}),
              },
            }
          : {}),
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
  const socials = sameAs.filter(isProfileUrl);

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
        '@id': LOCAL_BUSINESS_ID,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAMES,
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        logo: LOGO_URL,
        image: [DEFAULT_OG_IMAGE, LOGO_URL],
        parentOrganization: { '@id': ORGANIZATION_ID },
        knowsAbout: KNOWS_ABOUT,
        ...(latitude != null && longitude != null
          ? { hasMap: `https://www.google.com/maps?q=${latitude},${longitude}` }
          : {}),
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
  const imageList = (images?.length ? images : image ? [image] : undefined)?.map(mediaUrl);
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
        image: image ? [mediaUrl(image)] : undefined,
        hasVariant: products.map((p) => ({
          '@type': 'Product',
          name: p.name,
          url: `${SITE_URL}/products/${p.slug}`,
          image: p.image ? [mediaUrl(p.image)] : undefined,
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
        image: image ? [mediaUrl(image)] : undefined,
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
        image: image ? [mediaUrl(image)] : undefined,
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
        '@id': WEBSITE_ID,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAMES,
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        inLanguage: 'en',
        publisher: { '@id': ORGANIZATION_ID },
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
