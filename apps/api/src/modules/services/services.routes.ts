import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, notFound, param } from '../../utils/http.js';
import { slugify } from '../../utils/slug.js';
import { assertSlugAvailable } from '../../utils/slug-conflict.js';
import { faqItemSchema, normalizeSeoFields, seoFieldsSchema } from '../../utils/seo-fields.js';

const router = Router();

const upsertSchema = z
  .object({
    title: z.string().min(1),
    slug: z.string().optional(),
    narrative: z.string().min(1),
    icon: z.string().optional().nullable(),
    image: z.string().url().optional().nullable().or(z.literal('')),
    order: z.number().int().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    faqs: z.array(faqItemSchema).optional().nullable(),
  })
  .merge(seoFieldsSchema);

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
    if (!service || service.status !== 'PUBLISHED') throw notFound('Service not found');
    res.json({ service });
  }),
);

router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ body: upsertSchema }),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof upsertSchema>;
    const {
      seoTitle,
      seoDescription,
      primaryKeyword,
      ogTitle,
      ogDescription,
      ogImage,
      canonicalUrl,
      noIndex,
      faqs,
      image,
      ...data
    } = body;
    const slug = await assertSlugAvailable('service', data.slug ?? slugify(data.title));
    const seo = normalizeSeoFields({
      seoTitle,
      seoDescription,
      primaryKeyword,
      ogTitle,
      ogDescription,
      ogImage,
      canonicalUrl,
      noIndex,
    });

    const service = await prisma.service.create({
      data: {
        ...data,
        slug,
        image: image || null,
        faqs: faqs ?? undefined,
        ...seo,
      },
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
    const id = param(req, 'id');
    const body = req.body as Partial<z.infer<typeof upsertSchema>>;
    const {
      seoTitle,
      seoDescription,
      primaryKeyword,
      ogTitle,
      ogDescription,
      ogImage,
      canonicalUrl,
      noIndex,
      faqs,
      image,
      ...data
    } = body;

    let slug = data.slug;
    if (slug !== undefined || data.title) {
      const existing = await prisma.service.findUnique({ where: { id } });
      if (!existing) throw notFound('Service not found');
      slug = await assertSlugAvailable(
        'service',
        slug ?? data.title ?? existing.slug,
        id,
      );
    }

    const seo = normalizeSeoFields({
      seoTitle,
      seoDescription,
      primaryKeyword,
      ogTitle,
      ogDescription,
      ogImage,
      canonicalUrl,
      noIndex,
    });

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...data,
        ...(slug !== undefined ? { slug } : {}),
        ...(image !== undefined ? { image: image || null } : {}),
        ...(faqs !== undefined ? { faqs } : {}),
        ...seo,
      },
    });
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
