import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { env, isProd } from '../../config/env.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, tokenCandidates } from '../../middleware/auth.js';
import { asyncHandler, unauthorized } from '../../utils/http.js';
import {
  type SessionClaims,
  sessionIdFromToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt.js';
import {
  createSession,
  extendSession,
  isSessionActive,
  revokeOtherSessions,
  revokeSession,
} from './sessions.js';
import { imageRefSchema } from '../../utils/image-ref.js';

const router = Router();

/**
 * In production the web app and the API may be on different sites.
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

    const session = await createSession(user.id, req.get('user-agent'));
    const tokens = issueTokens(res, { sub: user.id, role: user.role, sid: session.id });

    res.json({
      ...tokens,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
    });
  }),
);

/** Sign a fresh access + refresh pair for a session and set the cookies. */
function issueTokens(res: Response, claims: SessionClaims) {
  const accessToken = signAccessToken(claims);
  const refreshToken = signRefreshToken(claims);
  res.cookie('accessToken', accessToken, { ...cookieOpts, maxAge: env.JWT_ACCESS_TTL * 1000 });
  res.cookie('refreshToken', refreshToken, {
    ...cookieOpts,
    maxAge: env.JWT_REFRESH_TTL * 1000,
  });
  return { accessToken, refreshToken };
}

function refreshTokenCandidates(req: Request): string[] {
  return [
    typeof req.body?.refreshToken === 'string' ? req.body.refreshToken.trim() : '',
    typeof req.cookies?.refreshToken === 'string' ? req.cookies.refreshToken.trim() : '',
  ].filter(Boolean);
}

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const candidates = refreshTokenCandidates(req);
    if (candidates.length === 0) throw unauthorized('Missing refresh token');

    for (const token of candidates) {
      let payload;
      try {
        payload = verifyRefreshToken(token);
      } catch {
        continue; // try the other source
      }
      if (!payload.sid || !(await isSessionActive(payload.sid, payload.sub))) continue;

      // Re-read the user so a changed role (or a deleted account) applies now.
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, role: true },
      });
      if (!user) continue;

      await extendSession(payload.sid);
      res.json(issueTokens(res, { sub: user.id, role: user.role, sid: payload.sid }));
      return;
    }
    throw unauthorized('Your session has ended. Please sign in again.');
  }),
);

/**
 * End this device's session. Works with whichever token the client still has
 * (refresh token in the body/cookie, or the access token), even if expired.
 */
router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const sids = new Set<string>();
    for (const token of refreshTokenCandidates(req)) {
      const sid = sessionIdFromToken(token, 'refresh');
      if (sid) sids.add(sid);
    }
    for (const token of tokenCandidates(req)) {
      const sid = sessionIdFromToken(token, 'access');
      if (sid) sids.add(sid);
    }
    await Promise.all([...sids].map((sid) => revokeSession(sid)));

    res.clearCookie('accessToken', cookieOpts);
    res.clearCookie('refreshToken', cookieOpts);
    res.json({ ok: true });
  }),
);

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
    // Anyone else signed in with the old password is signed out; this device stays in.
    const signedOut = await revokeOtherSessions(existing.id, req.user!.sid);
    res.json({ ok: true, otherSessionsEnded: signedOut });
  }),
);

export default router;
