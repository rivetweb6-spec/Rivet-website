import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';
import { PAGE_SEO_DEFAULTS, type PageSeoKey } from '@/lib/page-seo-defaults';
import { isIndexableSlug, SITE_URL } from '@/lib/seo';

export const revalidate = 3600;

const STATIC_PATHS = Object.values(PAGE_SEO_DEFAULTS).map((d) => d.path);

async function fetchAllProducts() {
  const pageSize = 100;
  let page = 1;
  const products: Awaited<ReturnType<typeof api.products.list>>['products'] = [];
  for (;;) {
    const result = await api.products.list({ page, pageSize });
    products.push(...result.products);
    if (page >= result.pagination.pages || result.products.length === 0) break;
    page += 1;
  }
  return products;
}

async function fetchAllArticles() {
  const pageSize = 100;
  let page = 1;
  const articles: Awaited<ReturnType<typeof api.news.list>>['articles'] = [];
  for (;;) {
    const result = await api.news.list({ page, pageSize });
    articles.push(...result.articles);
    if (page >= result.pagination.pages || result.articles.length === 0) break;
    page += 1;
  }
  return articles;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let noIndexKeys = new Set<string>();
  try {
    const { pages } = await api.pageSeo.list();
    noIndexKeys = new Set(pages.filter((p) => p.noIndex).map((p) => p.pageKey));
  } catch {
    /* defaults — include all static routes */
  }

  const staticRoutes: MetadataRoute.Sitemap = STATIC_PATHS.filter((path) => {
    const key = (Object.entries(PAGE_SEO_DEFAULTS).find(([, d]) => d.path === path)?.[0] ??
      '') as PageSeoKey | '';
    return !key || !noIndexKeys.has(key);
  }).map((path) => ({
    url: `${SITE_URL}${path === '/' ? '' : path}`,
    lastModified: new Date(),
    changeFrequency: path === '/' || path === '/products' ? ('daily' as const) : ('weekly' as const),
    priority: path === '/' ? 1 : path === '/request-quotation' ? 0.9 : 0.8,
  }));

  let productEntries: MetadataRoute.Sitemap = [];
  let categoryEntries: MetadataRoute.Sitemap = [];
  let serviceEntries: MetadataRoute.Sitemap = [];
  let newsEntries: MetadataRoute.Sitemap = [];
  let vacancyEntries: MetadataRoute.Sitemap = [];

  try {
    const products = await fetchAllProducts();
    productEntries = products
      .filter((p) => !p.noIndex && isIndexableSlug(p.slug))
      .map((p) => ({
        url: `${SITE_URL}/products/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
  } catch {
    /* API unavailable at build — static routes still ship */
  }

  try {
    const { categories } = await api.categories.list();
    categoryEntries = categories
      .filter((c) => !c.noIndex && isIndexableSlug(c.slug))
      .map((c) => ({
        url: `${SITE_URL}/products/${c.slug}`,
        lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      }));
  } catch {
    /* ignore */
  }

  try {
    const { services } = await api.services.list();
    serviceEntries = services
      .filter((s) => !s.noIndex && isIndexableSlug(s.slug))
      .map((s) => ({
        url: `${SITE_URL}/services/${s.slug}`,
        lastModified: s.updatedAt ? new Date(s.updatedAt) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.65,
      }));
  } catch {
    /* ignore */
  }

  try {
    const articles = await fetchAllArticles();
    newsEntries = articles
      .filter((a) => !a.noIndex && isIndexableSlug(a.slug))
      .map((a) => ({
        url: `${SITE_URL}/news/${a.slug}`,
        lastModified: a.updatedAt
          ? new Date(a.updatedAt)
          : a.publishedAt
            ? new Date(a.publishedAt)
            : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
  } catch {
    /* ignore */
  }

  try {
    const { vacancies } = await api.vacancies.list();
    vacancyEntries = vacancies
      .filter((v) => !v.noIndex && isIndexableSlug(v.slug))
      .map((v) => ({
        url: `${SITE_URL}/careers/${v.slug}`,
        lastModified: v.updatedAt ? new Date(v.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.65,
      }));
  } catch {
    /* ignore */
  }

  // De-dupe by URL (category and product share /products/[slug]).
  const byUrl = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entry of [
    ...staticRoutes,
    ...categoryEntries,
    ...productEntries,
    ...serviceEntries,
    ...newsEntries,
    ...vacancyEntries,
  ]) {
    const existing = byUrl.get(entry.url);
    if (!existing || (entry.priority ?? 0) >= (existing.priority ?? 0)) {
      byUrl.set(entry.url, entry);
    }
  }

  return [...byUrl.values()];
}
