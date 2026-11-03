import { Router } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, notFound, param } from '../../utils/http.js';
import { toCsv } from '../../utils/csv.js';
import {
  FORM_LIMITS,
  emailField,
  optionalText,
  parsePublicForm,
  publicFormLimiter,
  requiredText,
} from '../../utils/public-forms.js';
import { emitEvent } from '../../realtime/stream.js';

const router = Router();

/**
 * Public quotation form. `productSlug` / `productImage` are still accepted
 * from older clients but ignored: they are looked up from `productId` so a
 * visitor cannot plant an arbitrary URL (e.g. a tracking pixel) in the
 * admin inbox.
 */
const createSchema = z.object({
  fullName: requiredText('Full name', FORM_LIMITS.name),
  company: optionalText('Company name', FORM_LIMITS.company),
  email: emailField(),
  phone: requiredText('Phone number', FORM_LIMITS.phone),
  productInterest: requiredText('Product category', FORM_LIMITS.productInterest),
  productId: optionalText('Product', FORM_LIMITS.id),
  productName: optionalText('Product name', FORM_LIMITS.productName),
  quantity: optionalText('Quantity', FORM_LIMITS.quantity),
  message: optionalText('Message', FORM_LIMITS.message),
});

const quotationLimiter = publicFormLimiter('quotation requests', 10);

/** Trusted product details for a quotation, or nothing if the id is unknown. */
async function productDetails(productId: string | undefined) {
  if (!productId) return null;
  const product = await prisma.product.findFirst({
    where: { id: productId, status: 'PUBLISHED' },
    select: {
      id: true,
      name: true,
      slug: true,
      images: { orderBy: { order: 'asc' }, take: 1, select: { url: true } },
    },
  });
  if (!product) return null;
  return {
    productId: product.id,
    productSlug: product.slug,
    productImage: product.images[0]?.url ?? null,
    name: product.name,
  };
}

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
  quotationLimiter,
  asyncHandler(async (req, res) => {
    const { productId, productName, ...fields } = parsePublicForm(createSchema, req.body);
    const product = await productDetails(productId);
    const quotation = await prisma.quotationRequest.create({
      data: {
        ...fields,
        productName: productName ?? product?.name ?? null,
        productId: product?.productId ?? null,
        productSlug: product?.productSlug ?? null,
        productImage: product?.productImage ?? null,
      },
    });
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
    const [requests, counts, unread] = await Promise.all([
      prisma.quotationRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.quotationRequest.groupBy({ by: ['status'], _count: true }),
      prisma.quotationRequest.count({ where: { readAt: null } }),
    ]);
    res.json({ requests, counts, unread });
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

// Admin — mark every unread quotation as seen when the inbox is opened
router.patch(
  '/read-all',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  asyncHandler(async (_req, res) => {
    const result = await prisma.quotationRequest.updateMany({
      where: { readAt: null },
      data: { readAt: new Date() },
    });
    if (result.count > 0) {
      emitEvent({ type: 'quotation-read', data: { unread: 0 } });
    }
    res.json({ unread: 0 });
  }),
);

// Admin — mark a quotation as read when it is opened/viewed
router.patch(
  '/:id/read',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  asyncHandler(async (req, res) => {
    const id = param(req, 'id');
    const existing = await prisma.quotationRequest.findUnique({ where: { id } });
    if (!existing) throw notFound('Quotation request not found');

    const quotation = existing.readAt
      ? existing
      : await prisma.quotationRequest.update({
          where: { id },
          data: { readAt: new Date() },
        });

    const unread = await prisma.quotationRequest.count({ where: { readAt: null } });
    if (!existing.readAt) {
      emitEvent({ type: 'quotation-read', data: { id: quotation.id, unread } });
    }
    res.json({ quotation, unread });
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

// Admin — remove a processed request or spam submission
router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const id = param(req, 'id');
    const existing = await prisma.quotationRequest.findUnique({
      where: { id },
      select: { id: true, readAt: true },
    });
    if (!existing) throw notFound('Quotation request not found');

    await prisma.quotationRequest.delete({ where: { id } });

    const unread = await prisma.quotationRequest.count({ where: { readAt: null } });
    // Deleting an unread request lowers the badge count, so tell the dashboard.
    if (!existing.readAt) {
      emitEvent({ type: 'quotation-read', data: { id, unread } });
    }
    res.json({ ok: true, unread });
  }),
);

export default router;
