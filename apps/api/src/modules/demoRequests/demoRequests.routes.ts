import { Router } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, param } from '../../utils/http.js';
import { toCsv } from '../../utils/csv.js';
import { emitEvent } from '../../realtime/stream.js';

const router = Router();

const createSchema = z.object({
  fullName: z.string().min(1),
  company: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(1),
  productInterest: z.string().min(1),
  message: z.string().optional(),
});

const STATUSES = ['NEW', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'CLOSED'] as const;

// Public — submit a demo request
router.post(
  '/',
  validate({ body: createSchema }),
  asyncHandler(async (req, res) => {
    const demo = await prisma.demoRequest.create({ data: req.body });
    emitEvent({ type: 'demo-request', data: { id: demo.id, fullName: demo.fullName } });
    res.status(201).json({ ok: true, id: demo.id });
  }),
);

// Admin — list with filter
router.get(
  '/',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ query: z.object({ status: z.enum(STATUSES).optional() }) }),
  asyncHandler(async (req, res) => {
    const where: Prisma.DemoRequestWhereInput = {};
    if (req.query.status) where.status = req.query.status as (typeof STATUSES)[number];
    const requests = await prisma.demoRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    const counts = await prisma.demoRequest.groupBy({ by: ['status'], _count: true });
    res.json({ requests, counts });
  }),
);

// Admin — export CSV (before /:id)
router.get(
  '/export',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  asyncHandler(async (_req, res) => {
    const requests = await prisma.demoRequest.findMany({ orderBy: { createdAt: 'desc' } });
    const csv = toCsv(
      requests.map((r) => ({
        FullName: r.fullName,
        Company: r.company ?? '',
        Email: r.email,
        Phone: r.phone,
        ProductInterest: r.productInterest,
        Message: r.message ?? '',
        Status: r.status,
        Date: r.createdAt.toISOString(),
        AdminNotes: r.adminNotes ?? '',
      })),
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="demo-requests.csv"');
    res.send(csv);
  }),
);

// Admin — update status / notes
router.patch(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({
    body: z.object({ status: z.enum(STATUSES).optional(), adminNotes: z.string().optional() }),
  }),
  asyncHandler(async (req, res) => {
    const demo = await prisma.demoRequest.update({ where: { id: param(req, 'id') }, data: req.body });
    res.json({ demo });
  }),
);

export default router;
