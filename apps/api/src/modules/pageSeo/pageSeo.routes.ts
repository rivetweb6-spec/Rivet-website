import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, notFound, param } from '../../utils/http.js';
import { normalizeSeoFields, seoFieldsSchema } from '../../utils/seo-fields.js';

const router = Router();

export const PAGE_SEO_KEYS = [
  'home',
  'company',
  'certificate-portfolio',
  'team',
  'gallery',
  'services',
  'news',
  'contact',
  'request-quotation',
  'products',
  'careers',
] as const;

const pageKeySchema = z.enum(PAGE_SEO_KEYS);

// Public — list all or fetch one by pageKey
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const pages = await prisma.pageSeo.findMany({ orderBy: { pageKey: 'asc' } });
    res.json({ pages });
  }),
);

router.get(
  '/:pageKey',
  asyncHandler(async (req, res) => {
    const pageKey = param(req, 'pageKey');
    const parsed = pageKeySchema.safeParse(pageKey);
    if (!parsed.success) throw notFound('Unknown page key');
    const page = await prisma.pageSeo.findUnique({ where: { pageKey: parsed.data } });
    res.json({ page: page ?? null });
  }),
);

// Admin — upsert by pageKey
router.put(
  '/:pageKey',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ body: seoFieldsSchema }),
  asyncHandler(async (req, res) => {
    const pageKey = param(req, 'pageKey');
    const parsed = pageKeySchema.safeParse(pageKey);
    if (!parsed.success) throw notFound('Unknown page key');

    const data = normalizeSeoFields(req.body as z.infer<typeof seoFieldsSchema>);
    const page = await prisma.pageSeo.upsert({
      where: { pageKey: parsed.data },
      update: data,
      create: { pageKey: parsed.data, ...data },
    });
    res.json({ page });
  }),
);

export default router;
