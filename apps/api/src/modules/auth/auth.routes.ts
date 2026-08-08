import { Router } from 'express';
import bcrypt from 'bcryptjs';
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

router.post(
  '/login',
  validate({ body: z.object({ email: z.string().email(), password: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email: string; password: string };
    const user = await prisma.user.findUnique({ where: { email } });
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
      email: z.string().email().optional(),
      avatarUrl: z.string().url().nullable().optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.update({
      where: { id: req.user!.sub },
      data: req.body,
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
