import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { env, isProd } from '../../config/env.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { asyncHandler, unauthorized } from '../../utils/http.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt.js';
import { imageRefSchema } from '../../utils/image-ref.js';

const router = Router();

/**
 * Production web (Vercel) and API (Render) are different sites.
 * `sameSite: 'none'` + `secure` is required for cross-origin cookie auth.
 * Same-origin Next proxy still works with these flags.
 */
const cookieOpts = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
};

/**
 * The global limiter allows 300 requests/minute, which is far too generous for
 * password guessing. Successful logins are not counted so a working admin is
 * never locked out by their own activity.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Too many sign-in attempts. Please try again in a few minutes.' },
});

router.post(
  '/login',
  loginLimiter,
  validate({
    body: z.object({ email: z.string().trim().email(), password: z.string().min(1) }),
  }),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email: string; password: string };
    // Email is a case-insensitive identifier: "Admin@rivet.com" must reach the
    // account stored as "admin@rivet.com".
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    if (!user) throw unauthorized('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw unauthorized('Invalid credentials');

    const payload = { sub: user.id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.cookie('accessToken', accessToken, { ...cookieOpts, maxAge: env.JWT_ACCESS_TTL * 1000 });
    res.cookie('refreshToken', refreshToken, {
      ...cookieOpts,
      maxAge: env.JWT_REFRESH_TTL * 1000,
    });

    res.json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  }),
);

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const token = (req.cookies?.refreshToken as string | undefined) ?? req.body?.refreshToken;
    if (!token) throw unauthorized('Missing refresh token');
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw unauthorized('Invalid refresh token');
    }
    const accessToken = signAccessToken({ sub: payload.sub, role: payload.role });
    res.cookie('accessToken', accessToken, { ...cookieOpts, maxAge: env.JWT_ACCESS_TTL * 1000 });
    res.json({ accessToken });
  }),
);

router.post('/logout', (_req, res) => {
  res.clearCookie('accessToken', cookieOpts);
  res.clearCookie('refreshToken', cookieOpts);
  res.json({ ok: true });
});

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true },
    });
    if (!user) throw unauthorized();
    res.json({ user });
  }),
);

router.put(
  '/me',
  requireAuth,
  validate({
    body: z.object({
      name: z.string().min(1).optional(),
      email: z
        .string()
        .trim()
        .email()
        .transform((v) => v.toLowerCase())
        .optional(),
      avatarUrl: imageRefSchema.nullable().optional().or(z.literal('')),
    }),
  }),
  asyncHandler(async (req, res) => {
    const data = req.body as { name?: string; email?: string; avatarUrl?: string | null };
    const user = await prisma.user.update({
      where: { id: req.user!.sub },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl || null } : {}),
      },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true },
    });
    res.json({ user });
  }),
);

router.put(
  '/me/password',
  requireAuth,
  validate({
    body: z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };
    const existing = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!existing) throw unauthorized();
    const ok = await bcrypt.compare(currentPassword, existing.passwordHash);
    if (!ok) throw unauthorized('Current password is incorrect');
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash: await bcrypt.hash(newPassword, 12) },
    });
    res.json({ ok: true });
  }),
);

export default router;
