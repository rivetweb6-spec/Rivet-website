import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, notFound, param } from '../../utils/http.js';
import { slugify } from '../../utils/slug.js';

const router = Router();

const upsertSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  narrative: z.string().min(1),
  icon: z.string().optional(),
  image: z.string().url().optional(),
  order: z.number().int().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const services = await prisma.service.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { order: 'asc' },
    });
    res.json({ services });
  }),
);

// Admin — all statuses (must be before /:slug)
router.get(
  '/admin/all',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  asyncHandler(async (_req, res) => {
    const services = await prisma.service.findMany({ orderBy: { order: 'asc' } });
    res.json({ services });
  }),
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const service = await prisma.service.findUnique({ where: { slug: param(req, 'slug') } });
    if (!service) throw notFound('Service not found');
    res.json({ service });
  }),
);

router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ body: upsertSchema }),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof upsertSchema>;
    const service = await prisma.service.create({
      data: { ...data, slug: data.slug ?? slugify(data.title) },
    });
    res.status(201).json({ service });
  }),
);

router.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ body: upsertSchema.partial() }),
  asyncHandler(async (req, res) => {
    const service = await prisma.service.update({ where: { id: param(req, 'id') }, data: req.body });
    res.json({ service });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    await prisma.service.delete({ where: { id: param(req, 'id') } });
    res.json({ ok: true });
  }),
);

export default router;
