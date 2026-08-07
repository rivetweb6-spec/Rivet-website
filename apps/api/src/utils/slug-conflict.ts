import { prisma } from '../config/prisma.js';
import { badRequest } from './http.js';
import { slugify } from './slug.js';

type SlugEntity = 'product' | 'category' | 'service' | 'news';

/**
 * Ensure slug is unique within its table, and for products/categories
 * also unique across both (shared /products/[slug] namespace).
 */
export async function assertSlugAvailable(
  entity: SlugEntity,
  rawSlug: string,
  excludeId?: string,
): Promise<string> {
  const slug = slugify(rawSlug);
  if (!slug) throw badRequest('Slug cannot be empty');

  if (entity === 'product' || entity === 'category') {
    const [product, category] = await Promise.all([
      prisma.product.findUnique({ where: { slug }, select: { id: true } }),
      prisma.category.findUnique({ where: { slug }, select: { id: true } }),
    ]);

    if (entity === 'product' && product && product.id !== excludeId) {
      throw badRequest(`Slug "${slug}" is already used by another product`);
    }
    if (entity === 'category' && category && category.id !== excludeId) {
      throw badRequest(`Slug "${slug}" is already used by another category`);
    }
    if (entity === 'product' && category) {
      throw badRequest(`Slug "${slug}" is already used by a category`);
    }
    if (entity === 'category' && product) {
      throw badRequest(`Slug "${slug}" is already used by a product`);
    }
  } else if (entity === 'service') {
    const existing = await prisma.service.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existing && existing.id !== excludeId) {
      throw badRequest(`Slug "${slug}" is already used by another service`);
    }
  } else {
    const existing = await prisma.newsArticle.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existing && existing.id !== excludeId) {
      throw badRequest(`Slug "${slug}" is already used by another article`);
    }
  }

  return slug;
}
