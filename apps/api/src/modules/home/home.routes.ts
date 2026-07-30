import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/http.js';

const router = Router();

const homeSchema = z.object({
  eyebrow: z.string().optional().nullable(),
  headline: z.string().optional().nullable(),
  headlineAccent: z.string().optional().nullable(),
  subheadline: z.string().optional().nullable(),
  heroImage: z.string().optional().nullable(),
  introEyebrow: z.string().optional().nullable(),
  introTitle: z.string().optional().nullable(),
  introBody: z.string().optional().nullable(),
  introBodySecondary: z.string().optional().nullable(),
  introImage: z.string().optional().nullable(),
});

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const home = await prisma.homePageContent.findUnique({ where: { id: 'home' } });
    res.json({ home });
  }),
);

router.put(
  '/',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ body: homeSchema }),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof homeSchema>;
    const home = await prisma.homePageContent.upsert({
      where: { id: 'home' },
      update: data,
      create: { id: 'home', ...data },
    });
    res.json({ home });
  }),
);

export default router;
