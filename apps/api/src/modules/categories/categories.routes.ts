import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, notFound, param } from '../../utils/http.js';
import { slugify } from '../../utils/slug.js';
import { assertSlugAvailable } from '../../utils/slug-conflict.js';
import {
  faqItemSchema,
  normalizeSeoFields,
  seoFieldsSchema,
  toPrismaFaqs,
} from '../../utils/seo-fields.js';

const router = Router();

const upsertSchema = z
  .object({
    name: z.string().min(1),
    slug: z.string().optional(),
    description: z.string().optional().nullable(),
    image: z.string().url().optional().nullable().or(z.literal('')),
    order: z.number().int().optional(),
    faqs: z.array(faqItemSchema).optional().nullable(),
  })
  .merge(seoFieldsSchema);

// Public
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    res.json({ categories });
  }),
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const category = await prisma.category.findUnique({
      where: { slug: param(req, 'slug') },
    });
    if (!category) throw notFound('Category not found');
    res.json({ category });
  }),
);

// Admin
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
    const slug = await assertSlugAvailable('category', data.slug ?? slugify(data.name));
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

    const category = await prisma.category.create({
      data: {
        ...data,
        slug,
        image: image || null,
        faqs: toPrismaFaqs(faqs),
        ...seo,
      },
    });
    res.status(201).json({ category });
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
    if (slug !== undefined || data.name) {
      const existing = await prisma.category.findUnique({ where: { id } });
      if (!existing) throw notFound('Category not found');
      slug = await assertSlugAvailable(
        'category',
        slug ?? data.name ?? existing.slug,
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

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...data,
        ...(slug !== undefined ? { slug } : {}),
        ...(image !== undefined ? { image: image || null } : {}),
        ...(faqs !== undefined ? { faqs: toPrismaFaqs(faqs) } : {}),
        ...seo,
      },
    });
    res.json({ category });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    await prisma.category.delete({ where: { id: param(req, 'id') } });
    res.json({ ok: true });
  }),
);

export default router;
