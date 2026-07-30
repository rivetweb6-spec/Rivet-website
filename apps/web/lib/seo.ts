import type { Metadata } from 'next';
import type { NewsArticle, Product } from '@/lib/api';
import { assets } from '@/lib/assets';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://rivet.example.com';

export const SITE_NAME = 'RIVET — River Company';

export const DEFAULT_DESCRIPTION =
  'RIVET (River Company) imports and supplies premium elevators, lifts, granite, doors, sanitary ware, office furniture and fine building materials.';

export const DEFAULT_OG_IMAGE = assets.hero.poster;

type PageSeoInput = {
  title: string;
  description?: string;
  path?: string;
  image?: string | null;
  type?: 'website' | 'article';
  noIndex?: boolean;
};

/** Build consistent Metadata with Open Graph + Twitter for any public page. */
export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noIndex = false,
}: PageSeoInput): Metadata {
  const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const ogImage = image || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: { canonical: url },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type,
      locale: 'en_US',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export function productMetadata(product: Product): Metadata {
  const image = product.images[0]?.url ?? DEFAULT_OG_IMAGE;
  return pageMetadata({
    title: product.name,
    description: product.shortDescription ?? DEFAULT_DESCRIPTION,
    path: `/products/${product.slug}`,
    image,
  });
}

export function articleMetadata(article: NewsArticle): Metadata {
  return pageMetadata({
    title: article.title,
    description: article.excerpt ?? DEFAULT_DESCRIPTION,
    path: `/news/${article.slug}`,
    image: article.coverImage ?? assets.news.n1,
    type: 'article',
  });
}
