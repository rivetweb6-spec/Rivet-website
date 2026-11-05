import type { Metadata } from 'next';
import type { Category, NewsArticle, PageSeo, Product, Service, SeoFields, Vacancy } from '@/lib/api';
import { assets } from '@/lib/assets';
import { toAbsoluteMediaUrl } from '@/lib/media';
import { PAGE_SEO_DEFAULTS, type PageSeoKey } from '@/lib/page-seo-defaults';
import { stripHtml } from '@/lib/vacancies';

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '');
  if (explicit) return explicit;
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim().replace(/\/$/, '');
  if (vercelProd) return `https://${vercelProd.replace(/^https?:\/\//, '')}`;
  // Production domain — used when NEXT_PUBLIC_SITE_URL is not set.
  return 'https://rivetplc.com';
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = 'RIVET COMPANY';

/** Other names people search for (domain and email use "RIVET PLC"). */
export const SITE_ALTERNATE_NAMES = ['RIVET', 'RIVET PLC', 'Rivet Company', 'rivetplc'];

/** Stable schema.org ids so Organization, LocalBusiness and WebSite link up. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const LOCAL_BUSINESS_ID = `${SITE_URL}/#localbusiness`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const SITE_TAGLINE = 'Elevators & Building Materials in Ethiopia';

export const DEFAULT_DESCRIPTION =
  'RIVET COMPANY supplies elevators, passenger lifts, escalators, granite, doors, furniture, sanitary goods and building materials in Ethiopia. Get a quotation.';

export const SITE_KEYWORDS = [
  'RIVET COMPANY',
  'RIVET PLC',
  'rivetplc',
  'elevators in Ethiopia',
  'passenger lifts',
  'elevator solutions',
  'building materials suppliers',
  'escalators Ethiopia',
  'granite Ethiopia',
  'doors Ethiopia',
  'sanitary goods',
  'office furniture',
  'elevator installation',
  'request quotation',
  'Addis Ababa',
];

/** Branded 1200×630 share image (public/images), cropped from the homepage hero photo. */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-rivet.jpg`;

export const LOGO_URL = `${SITE_URL}/logo.png`;

export const META_DESCRIPTION_MAX = 160;

export type FaqItem = { question: string; answer: string };

export function parseFaqs(value: unknown): FaqItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is FaqItem =>
      Boolean(item) &&
      typeof item === 'object' &&
      typeof (item as FaqItem).question === 'string' &&
      typeof (item as FaqItem).answer === 'string',
  );
}

/** Dynamic product image alt when CMS alt is empty. */
export function buildProductAltText(
  name: string,
  category?: string | null,
  detail?: string | null,
): string {
  const parts = [name];
  if (category) parts.push(category);
  if (detail) parts.push(detail);
  return `${parts.join(' — ')} supplied by RIVET COMPANY in Ethiopia`;
}

export type CategoryAncestor = {
  name: string;
  slug: string;
  parent?: CategoryAncestor | null;
};

/** Build ancestor breadcrumbs from top-level down to the immediate parent. */
export function getCategoryAncestors(
  parent?: CategoryAncestor | null,
): { name: string; path: string }[] {
  const ancestors: { name: string; path: string }[] = [];
  let current = parent;
  while (current) {
    ancestors.unshift({ name: current.name, path: `/products/${current.slug}` });
    current = current.parent;
  }
  return ancestors;
}

export function buildPersonAltText(name: string, role?: string | null): string {
  const rolePart = role?.trim();
  return rolePart
    ? `${name}, ${rolePart} at RIVET COMPANY`
    : `${name} — RIVET COMPANY`;
}

/** Keep meta descriptions in the typical SERP window without cutting mid-word. */
export function truncateMetaDescription(text: string, max = META_DESCRIPTION_MAX): string {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (!compact) return DEFAULT_DESCRIPTION;
  if (compact.length <= max) return compact;
  const sliced = compact.slice(0, max - 1);
  const breakAt = sliced.lastIndexOf(' ');
  const clipped = (breakAt > 80 ? sliced.slice(0, breakAt) : sliced).replace(/[,;:.\-–—]+$/, '').trimEnd();
  return `${clipped}…`;
}

export function isIndexableSlug(slug: string | null | undefined): boolean {
  return Boolean(slug && /[a-z0-9]/i.test(slug));
}

export function resolveCanonicalUrl(path: string, canonicalUrl?: string | null): string {
  const trimmed = canonicalUrl?.trim();
  if (trimmed) {
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    const asPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${SITE_URL}${asPath}`;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized === '/' ? '' : normalized}`;
}

type PageSeoInput = {
  title: string;
  description?: string;
  path?: string;
  image?: string | null;
  type?: 'website' | 'article';
  noIndex?: boolean;
  keywords?: string[];
  ogTitle?: string | null;
  ogDescription?: string | null;
  canonicalUrl?: string | null;
  publishedTime?: string | null;
  modifiedTime?: string | null;
  section?: string | null;
};

/** Append the brand suffix only when the title does not already mention RIVET. */
export function withBrand(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return SITE_NAME;
  if (/\bRIVET\b/i.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed} | ${SITE_NAME}`;
}

/** Unique keywords preserving order (primary keyword first). */
function splitKeywordList(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw.split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
}

function mergeKeywords(...groups: (string | null | undefined)[][]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const group of groups) {
    for (const raw of group) {
      for (const k of splitKeywordList(raw)) {
        const key = k.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(k);
      }
    }
  }
  return out;
}

/** Build consistent Metadata with Open Graph + Twitter for any public page. */
export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noIndex = false,
  keywords = SITE_KEYWORDS,
  ogTitle,
  ogDescription,
  canonicalUrl,
  publishedTime,
  modifiedTime,
  section,
}: PageSeoInput): Metadata {
  const url = resolveCanonicalUrl(path, canonicalUrl);
  const ogImage = toAbsoluteMediaUrl(image || DEFAULT_OG_IMAGE, SITE_URL);
  const fullTitle = withBrand(title);
  const socialTitle = withBrand(ogTitle?.trim() || fullTitle);
  const metaDescription = truncateMetaDescription(description);
  const socialDescription = truncateMetaDescription(ogDescription?.trim() || metaDescription);

  return {
    // Absolute title bypasses the root `%s | RIVET COMPANY` template (avoids a doubled brand).
    title: { absolute: fullTitle },
    description: metaDescription,
    keywords,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
    openGraph: {
      title: socialTitle,
      description: socialDescription,
      url,
      siteName: SITE_NAME,
      locale: 'en_US',
      images: [{ url: ogImage, width: 1200, height: 630, alt: socialTitle }],
      ...(type === 'article'
        ? {
            type: 'article' as const,
            publishedTime: publishedTime ?? undefined,
            modifiedTime: modifiedTime ?? undefined,
            authors: [SITE_NAME],
            section: section ?? undefined,
          }
        : { type: 'website' as const }),
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: socialDescription,
      images: [ogImage],
    },
  };
}

/** Merge CMS SEO overrides with generated fallbacks. */
export function resolveSeo(
  overrides: SeoFields | PageSeo | null | undefined,
  fallback: {
    title: string;
    description: string;
    path: string;
    image?: string | null;
    keywords?: string[];
    type?: 'website' | 'article';
    publishedTime?: string | null;
    modifiedTime?: string | null;
    section?: string | null;
  },
): Metadata {
  const title = overrides?.seoTitle?.trim() || fallback.title;
  const description = overrides?.seoDescription?.trim() || fallback.description;
  const image = overrides?.ogImage?.trim() || fallback.image || DEFAULT_OG_IMAGE;
  const keywords = mergeKeywords(
    [overrides?.primaryKeyword],
    fallback.keywords ?? SITE_KEYWORDS,
  );

  return pageMetadata({
    title,
    description,
    path: fallback.path,
    image,
    type: fallback.type,
    noIndex: overrides?.noIndex ?? false,
    keywords,
    ogTitle: overrides?.ogTitle,
    ogDescription: overrides?.ogDescription,
    canonicalUrl: overrides?.canonicalUrl,
    publishedTime: fallback.publishedTime,
    modifiedTime: fallback.modifiedTime,
    section: fallback.section,
  });
}

/** Metadata for a static page key using shared defaults + optional CMS row. */
export function staticPageMetadata(
  pageKey: PageSeoKey,
  overrides?: SeoFields | PageSeo | null,
  extra?: {
    title?: string;
    description?: string;
    image?: string | null;
  },
): Metadata {
  const defaults = PAGE_SEO_DEFAULTS[pageKey];
  return resolveSeo(overrides, {
    title: extra?.title?.trim() || defaults.title,
    description: extra?.description?.trim() || defaults.description,
    path: defaults.path,
    image: extra?.image,
    keywords: mergeKeywords(defaults.keywords ?? [], SITE_KEYWORDS),
  });
}

/** Safe metadata when an entity slug cannot be resolved (still noindex). */
export function notFoundMetadata(sectionTitle: string): Metadata {
  return pageMetadata({
    title: `${sectionTitle} not found`,
    description: `The requested ${sectionTitle.toLowerCase()} could not be found. Browse RIVET products, services, or request a quotation in Ethiopia.`,
    path: '/',
    noIndex: true,
  });
}

export function productMetadata(product: Product): Metadata {
  const category = product.category?.name;
  const fallbackTitle = category ? `${product.name} in Ethiopia` : product.name;
  const fallbackDescription =
    product.shortDescription?.trim() ||
    `${product.name}${category ? ` from the ${category} range` : ''} at RIVET COMPANY. View specifications and request a quotation for your project in Ethiopia.`;

  return resolveSeo(product, {
    title: fallbackTitle,
    description: fallbackDescription,
    path: `/products/${product.slug}`,
    image: product.ogImage || product.images[0]?.url || DEFAULT_OG_IMAGE,
    keywords: mergeKeywords(
      [product.name, product.brand, category, 'Ethiopia', 'request quotation'],
      SITE_KEYWORDS.slice(0, 6),
    ),
  });
}

export function categoryMetadata(category: Category): Metadata {
  const fallbackTitle = `${category.name} in Ethiopia`;
  const fallbackDescription =
    category.description?.trim() ||
    `${category.name} supplied by RIVET COMPANY for residential and commercial projects in Ethiopia. Browse the range and request a quotation.`;

  return resolveSeo(category, {
    title: fallbackTitle,
    description: fallbackDescription,
    path: `/products/${category.slug}`,
    image: category.ogImage || category.image || DEFAULT_OG_IMAGE,
    keywords: mergeKeywords(
      [category.name, `${category.name} Ethiopia`, 'request quotation'],
      SITE_KEYWORDS.slice(0, 6),
    ),
  });
}

export function serviceMetadata(service: Service): Metadata {
  const fallbackTitle = `${service.title} in Ethiopia`;
  const fallbackDescription =
    service.narrative.slice(0, 200) ||
    `${service.title} by RIVET COMPANY for projects in Ethiopia. See what is included and request a quotation.`;

  return resolveSeo(service, {
    title: fallbackTitle,
    description: fallbackDescription,
    path: `/services/${service.slug}`,
    image: service.ogImage || service.image || DEFAULT_OG_IMAGE,
    keywords: mergeKeywords([service.title, `${service.title} Ethiopia`, 'RIVET COMPANY services'], SITE_KEYWORDS.slice(0, 5)),
  });
}

export function articleMetadata(article: NewsArticle): Metadata {
  return resolveSeo(article, {
    title: article.title,
    description: article.excerpt ?? DEFAULT_DESCRIPTION,
    path: `/news/${article.slug}`,
    image: article.ogImage || article.coverImage || assets.news.n1,
    type: 'article',
    keywords: mergeKeywords(
      [article.title, article.category ?? 'RIVET COMPANY news'],
      SITE_KEYWORDS.slice(0, 4),
    ),
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    section: article.category,
  });
}

export function vacancyMetadata(vacancy: Vacancy): Metadata {
  const fromBody = stripHtml(vacancy.description).slice(0, 200);
  const fallbackDescription =
    fromBody ||
    `Apply for the ${vacancy.title} role at RIVET COMPANY in Ethiopia. Review the responsibilities, requirements and application deadline.`;
  return resolveSeo(vacancy, {
    title: `${vacancy.title} | Careers`,
    description: fallbackDescription,
    path: `/careers/${vacancy.slug}`,
    keywords: mergeKeywords(
      [vacancy.title, vacancy.department, 'jobs Ethiopia', 'RIVET COMPANY vacancy'],
      SITE_KEYWORDS.slice(0, 4),
    ),
  });
}
