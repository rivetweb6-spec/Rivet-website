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
  productId: z.string().optional(),
  productName: z.string().optional(),
  productSlug: z.string().optional(),
  productImage: z.string().url().optional(),
  quantity: z.string().max(60).optional(),
  message: z.string().optional(),
});

export const QUOTATION_STATUSES = [
  'NEW',
  'UNDER_REVIEW',
  'CONTACTED',
  'QUOTATION_SENT',
  'APPROVED',
  'REJECTED',
  'COMPLETED',
] as const;

// Public — submit a quotation request
router.post(
  '/',
  validate({ body: createSchema }),
  asyncHandler(async (req, res) => {
    const quotation = await prisma.quotationRequest.create({ data: req.body });
    emitEvent({
      type: 'quotation-request',
      data: { id: quotation.id, fullName: quotation.fullName, productName: quotation.productName },
    });
    res.status(201).json({ ok: true, id: quotation.id });
  }),
);

// Admin — list with filter
router.get(
  '/',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ query: z.object({ status: z.enum(QUOTATION_STATUSES).optional() }) }),
  asyncHandler(async (req, res) => {
    const where: Prisma.QuotationRequestWhereInput = {};
    if (req.query.status) where.status = req.query.status as (typeof QUOTATION_STATUSES)[number];
    const requests = await prisma.quotationRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    const counts = await prisma.quotationRequest.groupBy({ by: ['status'], _count: true });
    res.json({ requests, counts });
  }),
);

// Admin — export CSV (before /:id)
router.get(
  '/export',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  asyncHandler(async (_req, res) => {
    const requests = await prisma.quotationRequest.findMany({ orderBy: { createdAt: 'desc' } });
    const csv = toCsv(
      requests.map((r) => ({
        FullName: r.fullName,
        Company: r.company ?? '',
        Email: r.email,
        Phone: r.phone,
        ProductInterest: r.productInterest,
        ProductName: r.productName ?? '',
        Quantity: r.quantity ?? '',
        Message: r.message ?? '',
        Status: r.status,
        Date: r.createdAt.toISOString(),
        AdminNotes: r.adminNotes ?? '',
      })),
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="quotation-requests.csv"');
    res.send(csv);
  }),
);

// Admin — update status / notes
router.patch(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({
    body: z.object({
      status: z.enum(QUOTATION_STATUSES).optional(),
      adminNotes: z.string().optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const quotation = await prisma.quotationRequest.update({
      where: { id: param(req, 'id') },
      data: req.body,
    });
    res.json({ quotation });
  }),
);

export default router;
