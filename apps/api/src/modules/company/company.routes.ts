import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/http.js';

const router = Router();

// Company info (singleton)
const companySchema = z.object({
  history: z.string().optional(),
  vision: z.string().optional(),
  mission: z.string().optional(),
  coreValues: z.array(z.string()).optional(),
  timeline: z
    .array(z.object({ year: z.string(), title: z.string(), description: z.string() }))
    .optional(),
  achievements: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
});

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const company = await prisma.companyInfo.findUnique({ where: { id: 'company' } });
    res.json({ company });
  }),
);

router.put(
  '/',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ body: companySchema }),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof companySchema>;
    const company = await prisma.companyInfo.upsert({
      where: { id: 'company' },
      update: data,
      create: { id: 'company', ...data },
    });
    res.json({ company });
  }),
);

export default router;
