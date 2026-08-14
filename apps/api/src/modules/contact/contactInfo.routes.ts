import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/http.js';

const router = Router();

const emptyToNull = (schema: z.ZodType<string>) =>
  z
    .union([schema, z.literal(''), z.null()])
    .optional()
    .transform((v) => (v ? v : null));

const schema = z.object({
  address: emptyToNull(z.string()),
  phone: emptyToNull(z.string()),
  email: emptyToNull(z.string().email()),
  whatsapp: emptyToNull(z.string()),
  facebook: emptyToNull(z.string()),
  linkedin: emptyToNull(z.string()),
  telegram: emptyToNull(z.string()),
  mapLat: z.number().nullable().optional(),
  mapLng: z.number().nullable().optional(),
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
