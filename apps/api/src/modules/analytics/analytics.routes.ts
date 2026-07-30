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
    const [products, categories, services, news, demoTotal, demoNew, contactMessages, demoByStatus] =
      await Promise.all([
        prisma.product.count(),
        prisma.category.count(),
        prisma.service.count(),
        prisma.newsArticle.count(),
        prisma.demoRequest.count(),
        prisma.demoRequest.count({ where: { status: 'NEW' } }),
        prisma.contactMessage.count(),
        prisma.demoRequest.groupBy({ by: ['status'], _count: true }),
      ]);

    const recentDemos = await prisma.demoRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    res.json({
      cards: { products, categories, services, news, demoTotal, demoNew, contactMessages },
      demoByStatus,
      recentDemos,
    });
  }),
);

export default router;
