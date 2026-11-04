import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, param } from '../../utils/http.js';
import { emitEvent } from '../../realtime/stream.js';
import {
  FORM_LIMITS,
  emailField,
  optionalText,
  parsePublicForm,
  publicFormLimiter,
  requiredText,
} from '../../utils/public-forms.js';

const router = Router();

const createSchema = z.object({
  name: requiredText('Name', FORM_LIMITS.name),
  email: emailField(),
  phone: optionalText('Phone number', FORM_LIMITS.phone),
  message: requiredText('Message', FORM_LIMITS.message),
});

const contactLimiter = publicFormLimiter('messages', 5);

// Public — submit a contact message
router.post(
  '/',
  contactLimiter,
  asyncHandler(async (req, res) => {
    const data = parsePublicForm(createSchema, req.body);
    const msg = await prisma.contactMessage.create({ data });
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

// Admin — flag a message as dealt with
router.patch(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ body: z.object({ handled: z.boolean() }) }),
  asyncHandler(async (req, res) => {
    const message = await prisma.contactMessage.update({
      where: { id: param(req, 'id') },
      data: { handled: (req.body as { handled: boolean }).handled },
    });
    res.json({ message });
  }),
);

// Admin — remove a handled message or spam submission
router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    await prisma.contactMessage.delete({ where: { id: param(req, 'id') } });
    res.json({ ok: true });
  }),
);

export default router;
