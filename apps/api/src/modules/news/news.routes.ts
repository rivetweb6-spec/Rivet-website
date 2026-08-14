import { Router } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, notFound, param } from '../../utils/http.js';
import { slugify } from '../../utils/slug.js';
import { assertSlugAvailable } from '../../utils/slug-conflict.js';
import { normalizeSeoFields, seoFieldsSchema } from '../../utils/seo-fields.js';
import { imageRefSchema } from '../../utils/image-ref.js';

const router = Router();

const listQuery = z.object({
  category: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(24).default(9),
});

const upsertSchema = z
  .object({
    title: z.string().min(1),
    slug: z.string().optional(),
    excerpt: z.string().optional().nullable(),
    body: z.string().min(1),
    coverImage: imageRefSchema.optional().nullable().or(z.literal('')),
    category: z.string().optional().nullable(),
    status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  })
  .merge(seoFieldsSchema);

// Public — published only
router.get(
  '/',
  validate({ query: listQuery }),
  asyncHandler(async (req, res) => {
    const q = req.query as unknown as z.infer<typeof listQuery>;
    const where: Prisma.NewsArticleWhereInput = { status: 'PUBLISHED' };
    if (q.category) where.category = q.category;

    const [total, articles] = await Promise.all([
      prisma.newsArticle.count({ where }),
      prisma.newsArticle.findMany({
        where,
        orderBy: [
          { publishedAt: { sort: 'desc', nulls: 'last' } },
          { createdAt: 'desc' },
        ],
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);
    res.json({
      articles,
      pagination: {
        page: q.page,
        pageSize: q.pageSize,
        total,
        pages: Math.ceil(total / q.pageSize),
      },
    });
  }),
);

// Admin — must be registered before /:slug
router.get(
  '/admin/all',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  asyncHandler(async (_req, res) => {
    const articles = await prisma.newsArticle.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ articles });
  }),
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const article = await prisma.newsArticle.findUnique({
      where: { slug: param(req, 'slug') },
    });
    if (!article || article.status !== 'PUBLISHED') throw notFound('Article not found');
    res.json({ article });
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
      coverImage,
      ...data
    } = body;
    const slug = await assertSlugAvailable('news', data.slug ?? slugify(data.title));
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

    const article = await prisma.newsArticle.create({
      data: {
        ...data,
        slug,
        coverImage: coverImage || null,
        ...seo,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      },
    });
    res.status(201).json({ article });
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
    const existing = await prisma.newsArticle.findUnique({ where: { id } });
    if (!existing) throw notFound('Article not found');

    const {
      seoTitle,
      seoDescription,
      primaryKeyword,
      ogTitle,
      ogDescription,
      ogImage,
      canonicalUrl,
      noIndex,
      coverImage,
      ...data
    } = body;

    let slug = data.slug;
    if (slug !== undefined || data.title) {
      slug = await assertSlugAvailable(
        'news',
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

    const article = await prisma.newsArticle.update({
      where: { id },
      data: {
        ...data,
        ...(slug !== undefined ? { slug } : {}),
        ...(coverImage !== undefined ? { coverImage: coverImage || null } : {}),
        ...seo,
        publishedAt:
          data.status === 'PUBLISHED' && !existing.publishedAt
            ? new Date()
            : existing.publishedAt,
      },
    });
    res.json({ article });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    await prisma.newsArticle.delete({ where: { id: param(req, 'id') } });
    res.json({ ok: true });
  }),
);

export default router;
