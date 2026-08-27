import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, notFound, param } from '../../utils/http.js';
import { imageRefSchema } from '../../utils/image-ref.js';

const router = Router();

const sectionEnum = z.enum(['LEADERSHIP', 'ENGINEERING', 'TEAM']);

const upsertSchema = z.object({
  fullName: z.string().min(1),
  position: z.string().min(1),
  bio: z.string().optional().nullable(),
  photo: imageRefSchema.optional().nullable().or(z.literal('')),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  linkedin: z.string().url().optional().nullable().or(z.literal('')),
  section: sectionEnum.optional(),
  order: z.number().int().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const members = await prisma.teamMember.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ section: 'asc' }, { order: 'asc' }],
    });
    res.json({ members });
  }),
);

router.get(
  '/admin/all',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  asyncHandler(async (_req, res) => {
    const members = await prisma.teamMember.findMany({
      orderBy: [{ section: 'asc' }, { order: 'asc' }],
    });
    res.json({ members });
  }),
);

router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ body: upsertSchema }),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof upsertSchema>;
    const { photo, email, linkedin, ...data } = body;
    const member = await prisma.teamMember.create({
      data: {
        ...data,
        photo: photo || null,
        email: email || null,
        linkedin: linkedin || null,
      },
    });
    res.status(201).json({ member });
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
      ids.map((id, index) => prisma.teamMember.update({ where: { id }, data: { order: index + 1 } })),
    );
    const members = await prisma.teamMember.findMany({
      orderBy: [{ section: 'asc' }, { order: 'asc' }],
    });
    res.json({ members });
  }),
);

router.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ body: upsertSchema.partial() }),
  asyncHandler(async (req, res) => {
    const id = param(req, 'id');
    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) throw notFound('Team member not found');

    const body = req.body as Partial<z.infer<typeof upsertSchema>>;
    const { photo, email, linkedin, ...data } = body;
    const member = await prisma.teamMember.update({
      where: { id },
      data: {
        ...data,
        ...(photo !== undefined ? { photo: photo || null } : {}),
        ...(email !== undefined ? { email: email || null } : {}),
        ...(linkedin !== undefined ? { linkedin: linkedin || null } : {}),
      },
    });
    res.json({ member });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const id = param(req, 'id');
    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) throw notFound('Team member not found');
    await prisma.teamMember.delete({ where: { id } });
    res.json({ ok: true });
  }),
);

export default router;
