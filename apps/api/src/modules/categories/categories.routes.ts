import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, notFound, param } from '../../utils/http.js';
import { slugify } from '../../utils/slug.js';

const router = Router();

const upsertSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  order: z.number().int().optional(),
});

// Public
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    res.json({ categories });
  }),
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const category = await prisma.category.findUnique({ where: { slug: param(req, 'slug') } });
    if (!category) throw notFound('Category not found');
    res.json({ category });
  }),
);

// Admin
router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ body: upsertSchema }),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof upsertSchema>;
    const category = await prisma.category.create({
      data: { ...data, slug: data.slug ?? slugify(data.name) },
    });
    res.status(201).json({ category });
  }),
);

router.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ body: upsertSchema.partial() }),
  asyncHandler(async (req, res) => {
    const category = await prisma.category.update({
      where: { id: param(req, 'id') },
      data: req.body,
    });
    res.json({ category });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    await prisma.category.delete({ where: { id: param(req, 'id') } });
    res.json({ ok: true });
  }),
);

export default router;
