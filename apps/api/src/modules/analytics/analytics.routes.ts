import { Router } from 'express';
import { prisma } from '../../config/prisma.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/http.js';

const router = Router();

router.get(
  '/overview',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  asyncHandler(async (_req, res) => {
    const [
      products,
      categories,
      services,
      news,
      quotationTotal,
      quotationNew,
      contactMessages,
      quotationsByStatus,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.service.count(),
      prisma.newsArticle.count(),
      prisma.quotationRequest.count(),
      prisma.quotationRequest.count({ where: { status: 'NEW' } }),
      prisma.contactMessage.count(),
      prisma.quotationRequest.groupBy({ by: ['status'], _count: true }),
    ]);

    const recentQuotations = await prisma.quotationRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    res.json({
      cards: { products, categories, services, news, quotationTotal, quotationNew, contactMessages },
      quotationsByStatus,
      recentQuotations,
    });
  }),
);

export default router;
