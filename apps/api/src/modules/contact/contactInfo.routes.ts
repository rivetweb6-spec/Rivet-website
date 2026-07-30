import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/http.js';

const router = Router();

const schema = z.object({
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  whatsapp: z.string().optional(),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  telegram: z.string().optional(),
  mapLat: z.number().optional(),
  mapLng: z.number().optional(),
});

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const info = await prisma.contactInfo.findUnique({ where: { id: 'contact' } });
    res.json({ info });
  }),
);

router.put(
  '/',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ body: schema }),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof schema>;
    const info = await prisma.contactInfo.upsert({
      where: { id: 'contact' },
      update: data,
      create: { id: 'contact', ...data },
    });
    res.json({ info });
  }),
);

export default router;
