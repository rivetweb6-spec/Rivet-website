import { Router } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, notFound, param } from '../../utils/http.js';
import { slugify } from '../../utils/slug.js';

const router = Router();

const listQuery = z.object({
  category: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(24).default(9),
});

const upsertSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  body: z.string().min(1),
  coverImage: z.string().url().optional(),
  category: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

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
        orderBy: { publishedAt: 'desc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);
    res.json({
      articles,
      pagination: { page: q.page, pageSize: q.pageSize, total, pages: Math.ceil(total / q.pageSize) },
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
    const article = await prisma.newsArticle.findUnique({ where: { slug: param(req, 'slug') } });
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
    const data = req.body as z.infer<typeof upsertSchema>;
    const article = await prisma.newsArticle.create({
      data: {
        ...data,
        slug: data.slug ?? slugify(data.title),
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
    const data = req.body as Partial<z.infer<typeof upsertSchema>>;
    const existing = await prisma.newsArticle.findUnique({ where: { id: param(req, 'id') } });
    if (!existing) throw notFound('Article not found');
    const article = await prisma.newsArticle.update({
      where: { id: param(req, 'id') },
      data: {
        ...data,
        publishedAt:
          data.status === 'PUBLISHED' && !existing.publishedAt ? new Date() : existing.publishedAt,
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
