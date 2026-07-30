import { Router } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, notFound, param } from '../../utils/http.js';
import { slugify } from '../../utils/slug.js';

const router = Router();

const listQuery = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  featured: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12),
});

const upsertSchema = z.object({
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
    .array(z.object({ url: z.string().url(), publicId: z.string().optional(), alt: z.string().optional() }))
    .optional(),
});

// Public — list with search, filter, pagination
router.get(
  '/',
  validate({ query: listQuery }),
  asyncHandler(async (req, res) => {
    const q = req.query as unknown as z.infer<typeof listQuery>;
    const where: Prisma.ProductWhereInput = { status: 'PUBLISHED' };
    if (q.category) where.category = { slug: q.category };
    if (q.featured) where.featured = q.featured === 'true';
    if (q.search) {
      where.OR = [
        { name: { contains: q.search, mode: 'insensitive' } },
        { shortDescription: { contains: q.search, mode: 'insensitive' } },
        { brand: { contains: q.search, mode: 'insensitive' } },
      ];
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
      pagination: { page: q.page, pageSize: q.pageSize, total, pages: Math.ceil(total / q.pageSize) },
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

// Public — detail by slug (+ related)
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { slug: param(req, 'slug') },
      include: { category: true, images: { orderBy: { order: 'asc' } } },
    });
    if (!product) throw notFound('Product not found');

    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id }, status: 'PUBLISHED' },
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
    const { images, ...data } = req.body as z.infer<typeof upsertSchema>;
    const product = await prisma.product.create({
      data: {
        ...data,
        slug: data.slug ?? slugify(data.name),
        specs: data.specs ?? undefined,
        features: data.features ?? undefined,
        images: images ? { create: images.map((img, i) => ({ ...img, order: i })) } : undefined,
      },
      include: { images: true },
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
    const { images, ...data } = req.body as Partial<z.infer<typeof upsertSchema>>;
    const product = await prisma.product.update({
      where: { id: param(req, 'id') },
      data: {
        ...data,
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
      include: { images: true },
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
