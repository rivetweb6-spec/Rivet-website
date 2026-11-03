import { prisma } from '../../config/prisma.js';
import { env } from '../../config/env.js';

/** Sessions live as long as the refresh token, extended on each refresh. */
function newExpiry(): Date {
  return new Date(Date.now() + env.JWT_REFRESH_TTL * 1000);
}

/** Start a session for a successful login, and tidy up the user's dead ones. */
export async function createSession(userId: string, userAgent?: string) {
  const now = new Date();
  await prisma.session.deleteMany({
    where: { userId, OR: [{ expiresAt: { lt: now } }, { revokedAt: { not: null } }] },
  });
  return prisma.session.create({
    data: {
      userId,
      expiresAt: newExpiry(),
      userAgent: userAgent ? userAgent.slice(0, 300) : null,
    },
  });
}

/** True when the session exists, belongs to the user, and is neither revoked nor expired. */
export async function isSessionActive(sid: string, userId: string): Promise<boolean> {
  const session = await prisma.session.findUnique({
    where: { id: sid },
    select: { userId: true, revokedAt: true, expiresAt: true },
  });
  return (
    !!session &&
    session.userId === userId &&
    session.revokedAt === null &&
    session.expiresAt.getTime() > Date.now()
  );
}

/** Sliding expiry: a refresh keeps an in-use session alive. */
export async function extendSession(sid: string): Promise<void> {
  await prisma.session.update({
    where: { id: sid },
    data: { lastUsedAt: new Date(), expiresAt: newExpiry() },
  });
}

/** End one session (logout). Unknown or already-ended sessions are ignored. */
export async function revokeSession(sid: string): Promise<void> {
  await prisma.session.updateMany({
    where: { id: sid, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/** End every session of a user except `keepSid` (password change). Returns how many ended. */
export async function revokeOtherSessions(userId: string, keepSid?: string): Promise<number> {
  const result = await prisma.session.updateMany({
    where: { userId, revokedAt: null, ...(keepSid ? { id: { not: keepSid } } : {}) },
    data: { revokedAt: new Date() },
  });
  return result.count;
}
