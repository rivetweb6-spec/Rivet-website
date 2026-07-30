import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/http.js';
import { emitEvent } from '../../realtime/stream.js';

const router = Router();

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(1),
});

// Public — submit a contact message
router.post(
  '/',
  validate({ body: createSchema }),
  asyncHandler(async (req, res) => {
    const msg = await prisma.contactMessage.create({ data: req.body });
    emitEvent({ type: 'contact-message', data: { id: msg.id, name: msg.name } });
    res.status(201).json({ ok: true });
  }),
);

// Admin — list messages
router.get(
  '/',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  asyncHandler(async (_req, res) => {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ messages });
  }),
);

export default router;
