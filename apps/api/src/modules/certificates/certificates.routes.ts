import { Router } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, notFound, param } from '../../utils/http.js';
import { imageRefSchema } from '../../utils/image-ref.js';

const router = Router();

const kindEnum = z.enum(['CERTIFICATE', 'PORTFOLIO']);

function extraImages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function serializeCertificate<T extends { images: unknown }>(certificate: T) {
  return { ...certificate, images: extraImages(certificate.images) };
}

const upsertSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  image: imageRefSchema.optional().nullable().or(z.literal('')),
  images: z.array(imageRefSchema.or(z.literal(''))).optional().nullable(),
  kind: kindEnum.optional(),
  order: z.number().int().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

const listQuery = z.object({
  kind: kindEnum.optional(),
});

router.get(
  '/',
  validate({ query: listQuery }),
  asyncHandler(async (req, res) => {
    const q = req.query as unknown as z.infer<typeof listQuery>;
    const where: Prisma.CertificateWhereInput = { status: 'PUBLISHED' };
    if (q.kind) where.kind = q.kind;
    const certificates = await prisma.certificate.findMany({
      where,
      orderBy: { order: 'asc' },
    });
    res.json({ certificates: certificates.map(serializeCertificate) });
  }),
);

router.get(
  '/admin/all',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  asyncHandler(async (_req, res) => {
    const certificates = await prisma.certificate.findMany({ orderBy: { order: 'asc' } });
    res.json({ certificates: certificates.map(serializeCertificate) });
  }),
);

router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ body: upsertSchema }),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof upsertSchema>;
    const { image, images, ...data } = body;
    const extras = extraImages(images);
    const certificate = await prisma.certificate.create({
      data: {
        ...data,
        image: image || null,
        images: extras,
      },
    });
    res.status(201).json({ certificate: serializeCertificate(certificate) });
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
    res.json({ certificates: certificates.map(serializeCertificate) });
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
    const { image, images, ...data } = body;
    const certificate = await prisma.certificate.update({
      where: { id },
      data: {
        ...data,
        ...(image !== undefined ? { image: image || null } : {}),
        ...(images !== undefined ? { images: extraImages(images) } : {}),
      },
    });
    res.json({ certificate: serializeCertificate(certificate) });
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
