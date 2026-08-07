import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/products',
    '/services',
    '/company',
    '/news',
    '/contact',
    '/request-quotation',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' || path === '/products' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : path === '/request-quotation' ? 0.9 : 0.8,
  }));

  let productEntries: MetadataRoute.Sitemap = [];
  let categoryEntries: MetadataRoute.Sitemap = [];
  let serviceEntries: MetadataRoute.Sitemap = [];
  let newsEntries: MetadataRoute.Sitemap = [];

  try {
    const { products } = await api.products.list({ pageSize: 200 });
    productEntries = products
      .filter((p) => !p.noIndex)
      .map((p) => ({
        url: `${SITE_URL}/products/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
  } catch {
    /* API unavailable at build — static routes still ship */
  }

  try {
    const { categories } = await api.categories.list();
    categoryEntries = categories
      .filter((c) => !c.noIndex)
      .map((c) => ({
        url: `${SITE_URL}/products/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      }));
  } catch {
    /* ignore */
  }

  try {
    const { services } = await api.services.list();
    serviceEntries = services
      .filter((s) => !s.noIndex)
      .map((s) => ({
        url: `${SITE_URL}/services/${s.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.65,
      }));
  } catch {
    /* ignore */
  }

  try {
    const { articles } = await api.news.list({ pageSize: 200 });
    newsEntries = articles
      .filter((a) => !a.noIndex)
      .map((a) => ({
        url: `${SITE_URL}/news/${a.slug}`,
        lastModified: a.publishedAt ? new Date(a.publishedAt) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
  } catch {
    /* ignore */
  }

  return [
    ...staticRoutes,
    ...categoryEntries,
    ...productEntries,
    ...serviceEntries,
    ...newsEntries,
  ];
}
