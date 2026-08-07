import type { Metadata } from 'next';
import type { Category, NewsArticle, PageSeo, Product, Service, SeoFields } from '@/lib/api';
import { assets } from '@/lib/assets';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://rivet.example.com';

export const SITE_NAME = 'RIVET — River Company';

export const SITE_TAGLINE = 'Premium Construction & Architectural Products';

export const DEFAULT_DESCRIPTION =
  'RIVET (River Company) imports and supplies premium elevators, passenger lifts, granite, doors, sanitary ware, office furniture and fine building materials for commercial and residential projects in Ethiopia. Request a quotation for your next build.';

export const SITE_KEYWORDS = [
  'RIVET',
  'River Company',
  'elevators Ethiopia',
  'passenger lifts',
  'granite supplier',
  'architectural doors',
  'building materials import',
  'construction products',
  'sanitary ware',
  'office furniture',
  'premium elevators',
  'request quotation',
  'Addis Ababa',
];

export const DEFAULT_OG_IMAGE = assets.hero.poster;

export const LOGO_URL = `${SITE_URL}/logo.png`;

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
  return `${parts.join(' — ')} supplied by Rivet in Ethiopia`;
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
};

function withBrand(title: string): string {
  return title.includes('RIVET') || title.includes('Rivet') ? title : `${title} | Rivet`;
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
}: PageSeoInput): Metadata {
  const pathUrl = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const url = canonicalUrl?.trim() || pathUrl;
  const ogImage = image || DEFAULT_OG_IMAGE;
  const fullTitle = withBrand(title);
  const socialTitle = ogTitle?.trim() || fullTitle;
  const socialDescription = ogDescription?.trim() || description;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: socialTitle,
      description: socialDescription,
      url,
      siteName: SITE_NAME,
      type,
      locale: 'en_US',
      images: [{ url: ogImage, width: 1200, height: 630, alt: socialTitle }],
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
  },
): Metadata {
  const title = overrides?.seoTitle?.trim() || fallback.title;
  const description = overrides?.seoDescription?.trim() || fallback.description;
  const image = overrides?.ogImage?.trim() || fallback.image || DEFAULT_OG_IMAGE;
  const keywords = [
    ...(overrides?.primaryKeyword ? [overrides.primaryKeyword] : []),
    ...(fallback.keywords ?? SITE_KEYWORDS),
  ];

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
  });
}

export function productMetadata(product: Product): Metadata {
  const category = product.category?.name;
  const fallbackTitle = category
    ? `${product.name} in Ethiopia | Rivet`
    : `${product.name} | Rivet`;
  const fallbackDescription =
    product.shortDescription?.trim() ||
    `Explore ${product.name}${category ? ` from our ${category} range` : ''} at Rivet. Request a quotation for premium construction and architectural products in Ethiopia.`;

  return resolveSeo(product, {
    title: fallbackTitle,
    description: fallbackDescription,
    path: `/products/${product.slug}`,
    image: product.ogImage || product.images[0]?.url || DEFAULT_OG_IMAGE,
    keywords: [
      product.name,
      product.brand ?? 'RIVET',
      category ?? 'construction products',
      'Ethiopia',
      'request quotation',
      ...SITE_KEYWORDS.slice(0, 6),
    ],
  });
}

export function categoryMetadata(category: Category): Metadata {
  const fallbackTitle = `Premium ${category.name} in Ethiopia | Rivet`;
  const fallbackDescription =
    category.description?.trim() ||
    `Explore high-quality ${category.name.toLowerCase()} from Rivet. Request a quotation for durable, modern products supplied in Ethiopia.`;

  return resolveSeo(category, {
    title: fallbackTitle,
    description: fallbackDescription,
    path: `/products/${category.slug}`,
    image: category.ogImage || category.image || DEFAULT_OG_IMAGE,
    keywords: [
      category.name,
      `${category.name} Ethiopia`,
      'Rivet',
      'request quotation',
      ...SITE_KEYWORDS.slice(0, 6),
    ],
  });
}

export function serviceMetadata(service: Service): Metadata {
  const fallbackTitle = `${service.title} in Ethiopia | Rivet`;
  const fallbackDescription =
    service.narrative.slice(0, 160) ||
    `${service.title} from Rivet — quality elevators and building solutions in Ethiopia. Request a quotation today.`;

  return resolveSeo(service, {
    title: fallbackTitle,
    description: fallbackDescription,
    path: `/services/${service.slug}`,
    image: service.ogImage || service.image || DEFAULT_OG_IMAGE,
    keywords: [service.title, 'Ethiopia', 'Rivet services', ...SITE_KEYWORDS.slice(0, 5)],
  });
}

export function articleMetadata(article: NewsArticle): Metadata {
  return resolveSeo(article, {
    title: article.title,
    description: article.excerpt ?? DEFAULT_DESCRIPTION,
    path: `/news/${article.slug}`,
    image: article.ogImage || article.coverImage || assets.news.n1,
    type: 'article',
    keywords: [article.title, article.category ?? 'RIVET news', ...SITE_KEYWORDS.slice(0, 4)],
  });
}
