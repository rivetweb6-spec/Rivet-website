import { Router } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, notFound, param } from '../../utils/http.js';
import { slugify } from '../../utils/slug.js';
import { assertSlugAvailable } from '../../utils/slug-conflict.js';
import { rankProducts, rankByName } from '../../utils/product-search.js';
import { normalizeSeoFields, seoFieldsSchema } from '../../utils/seo-fields.js';

const router = Router();

const listQuery = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  featured: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12),
});

const upsertSchema = z
  .object({
    name: z.string().min(1),
    slug: z.string().optional(),
    categoryId: z.string().min(1),
    shortDescription: z.string().optional(),
    description: z.string().optional(),
    brand: z.string().optional(),
    countryOfOrigin: z.string().optional(),
    specs: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
    features: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    images: z
      .array(
        z.object({
          url: z.string().url(),
          publicId: z.string().optional(),
          alt: z.string().optional().nullable(),
        }),
      )
      .optional(),
  })
  .merge(seoFieldsSchema);

const searchCandidateSelect = {
  id: true,
  name: true,
  slug: true,
  shortDescription: true,
  description: true,
  brand: true,
  countryOfOrigin: true,
  features: true,
  category: { select: { name: true, slug: true } },
} as const;

// Public — list with search, filter, pagination
router.get(
  '/',
  validate({ query: listQuery }),
  asyncHandler(async (req, res) => {
    const q = req.query as unknown as z.infer<typeof listQuery>;
    const where: Prisma.ProductWhereInput = { status: 'PUBLISHED' };
    if (q.category) where.category = { slug: q.category };
    if (q.featured) where.featured = q.featured === 'true';

    if (q.search?.trim()) {
      const candidates = await prisma.product.findMany({ where, select: searchCandidateSelect });
      const ranked = rankProducts(candidates, q.search);
      const total = ranked.length;
      const pageIds = ranked
        .slice((q.page - 1) * q.pageSize, q.page * q.pageSize)
        .map((r) => r.id);
      const rows = await prisma.product.findMany({
        where: { id: { in: pageIds } },
        include: { category: true, images: { orderBy: { order: 'asc' } } },
      });
      const byId = new Map(rows.map((row) => [row.id, row]));
      const products = pageIds.flatMap((id) => byId.get(id) ?? []);

      res.json({
        products,
        pagination: {
          page: q.page,
          pageSize: q.pageSize,
          total,
          pages: Math.ceil(total / q.pageSize),
        },
      });
      return;
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: { category: true, images: { orderBy: { order: 'asc' } } },
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);

    res.json({
      products,
      pagination: {
        page: q.page,
        pageSize: q.pageSize,
        total,
        pages: Math.ceil(total / q.pageSize),
      },
    });
  }),
);

// Public — live search suggestions (must be before /:slug)
router.get(
  '/suggest',
  validate({ query: z.object({ q: z.string().max(200).default('') }) }),
  asyncHandler(async (req, res) => {
    const query = String(req.query.q ?? '').trim();
    if (query.length < 2) {
      res.json({ products: [], categories: [] });
      return;
    }

    const [candidates, allCategories] = await Promise.all([
      prisma.product.findMany({ where: { status: 'PUBLISHED' }, select: searchCandidateSelect }),
      prisma.category.findMany({ select: { name: true, slug: true } }),
    ]);

    const ranked = rankProducts(candidates, query).slice(0, 8);
    const rows = ranked.length
      ? await prisma.product.findMany({
          where: { id: { in: ranked.map((r) => r.id) } },
          select: {
            id: true,
            name: true,
            slug: true,
            category: { select: { name: true, slug: true } },
            images: { orderBy: { order: 'asc' }, take: 1, select: { url: true, alt: true } },
          },
        })
      : [];
    const byId = new Map(rows.map((row) => [row.id, row]));

    res.json({
      products: ranked.flatMap((r) => {
        const p = byId.get(r.id);
        return p
          ? [
              {
                id: p.id,
                name: p.name,
                slug: p.slug,
                category: p.category?.name ?? null,
                image: p.images[0]?.url ?? null,
              },
            ]
          : [];
      }),
      categories: rankByName(allCategories, query).slice(0, 4),
    });
  }),
);

// Admin — all statuses (must be before /:slug)
router.get(
  '/admin/all',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  asyncHandler(async (_req, res) => {
    const products = await prisma.product.findMany({
      include: { category: true, images: { orderBy: { order: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ products });
  }),
);

// Public — detail by slug (+ related); published only
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { slug: param(req, 'slug') },
      include: { category: true, images: { orderBy: { order: 'asc' } } },
    });
    if (!product || product.status !== 'PUBLISHED') throw notFound('Product not found');

    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: 'PUBLISHED',
      },
      include: { images: { orderBy: { order: 'asc' }, take: 1 } },
      take: 4,
    });

    res.json({ product, related });
  }),
);

// Admin CRUD
router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ body: upsertSchema }),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof upsertSchema>;
    const {
      images,
      seoTitle,
      seoDescription,
      primaryKeyword,
      ogTitle,
      ogDescription,
      ogImage,
      canonicalUrl,
      noIndex,
      ...data
    } = body;
    const slug = await assertSlugAvailable('product', data.slug ?? slugify(data.name));
    const seo = normalizeSeoFields({
      seoTitle,
      seoDescription,
      primaryKeyword,
      ogTitle,
      ogDescription,
      ogImage,
      canonicalUrl,
      noIndex,
    });

    const product = await prisma.product.create({
      data: {
        ...data,
        slug,
        ...seo,
        specs: data.specs ?? undefined,
        features: data.features ?? undefined,
        images: images ? { create: images.map((img, i) => ({ ...img, order: i })) } : undefined,
      },
      include: { images: true, category: true },
    });
    res.status(201).json({ product });
  }),
);

router.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ body: upsertSchema.partial() }),
  asyncHandler(async (req, res) => {
    const id = param(req, 'id');
    const body = req.body as Partial<z.infer<typeof upsertSchema>>;
    const {
      images,
      seoTitle,
      seoDescription,
      primaryKeyword,
      ogTitle,
      ogDescription,
      ogImage,
      canonicalUrl,
      noIndex,
      ...data
    } = body;

    let slug = data.slug;
    if (slug !== undefined || data.name) {
      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing) throw notFound('Product not found');
      slug = await assertSlugAvailable(
        'product',
        slug ?? data.name ?? existing.slug,
        id,
      );
    }

    const seo = normalizeSeoFields({
      seoTitle,
      seoDescription,
      primaryKeyword,
      ogTitle,
      ogDescription,
      ogImage,
      canonicalUrl,
      noIndex,
    });

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(slug !== undefined ? { slug } : {}),
        ...seo,
        specs: data.specs ?? undefined,
        features: data.features ?? undefined,
        ...(images
          ? {
              images: {
                deleteMany: {},
                create: images.map((img, i) => ({ ...img, order: i })),
              },
            }
          : {}),
      },
      include: { images: true, category: true },
    });
    res.json({ product });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    await prisma.product.delete({ where: { id: param(req, 'id') } });
    res.json({ ok: true });
  }),
);

export default router;
