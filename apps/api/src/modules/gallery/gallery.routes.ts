import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, notFound, param } from '../../utils/http.js';
import { imageRefSchema } from '../../utils/image-ref.js';

const router = Router();

const categoryEnum = z.enum(['PHOTOS', 'ACTIVITIES', 'PROJECTS', 'EVENTS', 'OTHER']);

const listQuery = z.object({
  category: categoryEnum.optional(),
});

const upsertSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  image: imageRefSchema,
  category: categoryEnum.optional(),
  order: z.number().int().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

router.get(
  '/',
  validate({ query: listQuery }),
  asyncHandler(async (req, res) => {
    const q = req.query as unknown as z.infer<typeof listQuery>;
    const images = await prisma.galleryImage.findMany({
      where: {
        status: 'PUBLISHED',
        ...(q.category ? { category: q.category } : {}),
      },
      orderBy: { order: 'asc' },
    });
    res.json({ images });
  }),
);

router.get(
  '/admin/all',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  asyncHandler(async (_req, res) => {
    const images = await prisma.galleryImage.findMany({ orderBy: { order: 'asc' } });
    res.json({ images });
  }),
);

router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ body: upsertSchema }),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof upsertSchema>;
    const image = await prisma.galleryImage.create({ data: body });
    res.status(201).json({ image });
  }),
);

router.put(
  '/reorder',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ body: reorderSchema }),
  asyncHandler(async (req, res) => {
    const { ids } = req.body as z.infer<typeof reorderSchema>;
    await prisma.$transaction(
      ids.map((id, index) => prisma.galleryImage.update({ where: { id }, data: { order: index + 1 } })),
    );
    const images = await prisma.galleryImage.findMany({ orderBy: { order: 'asc' } });
    res.json({ images });
  }),
);

router.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ body: upsertSchema.partial() }),
  asyncHandler(async (req, res) => {
    const id = param(req, 'id');
    const existing = await prisma.galleryImage.findUnique({ where: { id } });
    if (!existing) throw notFound('Gallery image not found');

    const image = await prisma.galleryImage.update({
      where: { id },
      data: req.body as Partial<z.infer<typeof upsertSchema>>,
    });
    res.json({ image });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const id = param(req, 'id');
    const existing = await prisma.galleryImage.findUnique({ where: { id } });
    if (!existing) throw notFound('Gallery image not found');
    await prisma.galleryImage.delete({ where: { id } });
    res.json({ ok: true });
  }),
);

export default router;
