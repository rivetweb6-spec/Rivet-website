import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import categoryRoutes from './modules/categories/categories.routes.js';
import productRoutes from './modules/products/products.routes.js';
import serviceRoutes from './modules/services/services.routes.js';
import certificateRoutes from './modules/certificates/certificates.routes.js';
import newsRoutes from './modules/news/news.routes.js';
import quotationRoutes from './modules/quotations/quotations.routes.js';
import contactRoutes from './modules/contact/contact.routes.js';
import contactInfoRoutes from './modules/contact/contactInfo.routes.js';
import companyRoutes from './modules/company/company.routes.js';
import homeRoutes from './modules/home/home.routes.js';
import uploadRoutes from './modules/uploads/uploads.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import pageSeoRoutes from './modules/pageSeo/pageSeo.routes.js';
import { sseHandler } from './realtime/stream.js';
import { requireAuth } from './middleware/auth.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/services', serviceRoutes);
router.use('/certificates', certificateRoutes);
router.use('/news', newsRoutes);
router.use('/quotation-requests', quotationRoutes);
// Legacy alias — older clients posted demo requests here.
router.use('/demo-requests', quotationRoutes);
router.use('/contact', contactRoutes);
router.use('/contact-info', contactInfoRoutes);
router.use('/company', companyRoutes);
router.use('/home', homeRoutes);
router.use('/page-seo', pageSeoRoutes);
router.use('/uploads', uploadRoutes);
router.use('/analytics', analyticsRoutes);

// Live event stream (admin dashboard notifications)
router.get('/events', requireAuth, sseHandler);

export default router;
