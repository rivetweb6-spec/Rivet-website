import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, notFound, param } from '../../utils/http.js';
import { imageRefSchema } from '../../utils/image-ref.js';

const router = Router();

const upsertSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  image: imageRefSchema.optional().nullable().or(z.literal('')),
  order: z.number().int().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const certificates = await prisma.certificate.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { order: 'asc' },
    });
    res.json({ certificates });
  }),
);

router.get(
  '/admin/all',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  asyncHandler(async (_req, res) => {
    const certificates = await prisma.certificate.findMany({ orderBy: { order: 'asc' } });
    res.json({ certificates });
  }),
);

router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ body: upsertSchema }),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof upsertSchema>;
    const { image, ...data } = body;
    const certificate = await prisma.certificate.create({
      data: {
        ...data,
        image: image || null,
      },
    });
    res.status(201).json({ certificate });
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
      ids.map((id, index) =>
        prisma.certificate.update({ where: { id }, data: { order: index + 1 } }),
      ),
    );
    const certificates = await prisma.certificate.findMany({ orderBy: { order: 'asc' } });
    res.json({ certificates });
  }),
);

router.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ body: upsertSchema.partial() }),
  asyncHandler(async (req, res) => {
    const id = param(req, 'id');
    const existing = await prisma.certificate.findUnique({ where: { id } });
    if (!existing) throw notFound('Certificate not found');

    const body = req.body as Partial<z.infer<typeof upsertSchema>>;
    const { image, ...data } = body;
    const certificate = await prisma.certificate.update({
      where: { id },
      data: {
        ...data,
        ...(image !== undefined ? { image: image || null } : {}),
      },
    });
    res.json({ certificate });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const id = param(req, 'id');
    const existing = await prisma.certificate.findUnique({ where: { id } });
    if (!existing) throw notFound('Certificate not found');
    await prisma.certificate.delete({ where: { id } });
    res.json({ ok: true });
  }),
);

export default router;
