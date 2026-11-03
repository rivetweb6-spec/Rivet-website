import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/http.js';
import { signAccessToken } from '../utils/jwt.js';

// Session lookups hit the database; tests decide which sessions are active.
const activeSessions = new Set<string>();
vi.mock('../modules/auth/sessions.js', () => ({
  isSessionActive: vi.fn(async (sid: string) => activeSessions.has(sid)),
}));

const { requireAuth, tokenCandidates } = await import('./auth.js');

const payload = { sub: 'user-1', role: 'ADMIN', sid: 'session-1' };

beforeEach(() => {
  activeSessions.clear();
  activeSessions.add('session-1');
});

function expiredAccess() {
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign({ ...payload, iat: now - 120, exp: now - 60 }, env.JWT_ACCESS_SECRET);
}

async function run(req: Partial<Request>) {
  const next = vi.fn() as unknown as NextFunction;
  const full = {
    headers: {},
    query: {},
    cookies: {},
    ...req,
  } as Request;
  await requireAuth(full, {} as Response, next);
  return { next, req: full };
}

const errorOf = (next: NextFunction) =>
  (next as unknown as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as ApiError | undefined;

describe('tokenCandidates', () => {
  it('reads bearer, query, and cookie without duplicates', () => {
    const token = signAccessToken(payload);
    expect(
      tokenCandidates({
        headers: { authorization: `Bearer ${token}` },
        query: { token },
        cookies: { accessToken: token },
      } as unknown as Request),
    ).toEqual([token]);
  });
});

describe('requireAuth', () => {
  it('accepts a valid bearer token with an active session', async () => {
    const token = signAccessToken(payload);
    const { next, req } = await run({ headers: { authorization: `Bearer ${token}` } });
    expect(req.user).toEqual(expect.objectContaining(payload));
    expect(next).toHaveBeenCalledWith();
  });

  it('falls back to a valid cookie when bearer is expired', async () => {
    const fresh = signAccessToken(payload);
    const { next, req } = await run({
      headers: { authorization: `Bearer ${expiredAccess()}` },
      cookies: { accessToken: fresh },
    });
    expect(req.user).toEqual(expect.objectContaining(payload));
    expect(next).toHaveBeenCalledWith();
  });

  it('rejects when every token is expired', async () => {
    const { next } = await run({ headers: { authorization: `Bearer ${expiredAccess()}` } });
    const err = errorOf(next)!;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(401);
    expect(err.message).toBe('Invalid or expired token');
  });

  it('asks for authentication when no token is present', async () => {
    const { next } = await run({});
    expect(errorOf(next)?.message).toBe('Authentication required');
  });
});

describe('requireAuth — sessions', () => {
  it('rejects a correctly signed token whose session was ended (logout / password change)', async () => {
    const token = signAccessToken(payload);
    activeSessions.delete('session-1');
    const { next, req } = await run({ headers: { authorization: `Bearer ${token}` } });
    expect(errorOf(next)?.status).toBe(401);
    expect(req.user).toBeUndefined();
  });

  it('rejects legacy tokens that carry no session id', async () => {
    const legacy = jwt.sign({ sub: 'user-1', role: 'ADMIN' }, env.JWT_ACCESS_SECRET, { expiresIn: 600 });
    const { next } = await run({ headers: { authorization: `Bearer ${legacy}` } });
    expect(errorOf(next)?.status).toBe(401);
  });

  it('uses a cookie for a live session when the bearer belongs to an ended one', async () => {
    const ended = signAccessToken({ ...payload, sid: 'session-old' });
    const live = signAccessToken(payload);
    const { next, req } = await run({
      headers: { authorization: `Bearer ${ended}` },
      cookies: { accessToken: live },
    });
    expect(next).toHaveBeenCalledWith();
    expect(req.user?.sid).toBe('session-1');
  });

  it('passes database errors to the error handler instead of hanging', async () => {
    const sessions = await import('../modules/auth/sessions.js');
    vi.mocked(sessions.isSessionActive).mockRejectedValueOnce(new Error('db down'));
    const { next } = await run({ headers: { authorization: `Bearer ${signAccessToken(payload)}` } });
    expect((errorOf(next) as unknown as Error).message).toBe('db down');
  });
});

describe('requireAuth — cross-site cookie writes (CSRF)', () => {
  // Tests run with the default CORS_ORIGIN of http://localhost:3000.
  const ours = 'http://localhost:3000';
  const evil = 'https://evil.vercel.app';

  it('blocks a cookie-authenticated POST from another site', async () => {
    const { next, req } = await run({
      method: 'POST',
      headers: { origin: evil },
      cookies: { accessToken: signAccessToken(payload) },
    });
    expect(errorOf(next)?.status).toBe(403);
    expect(req.user).toBeUndefined();
  });

  it.each(['PUT', 'PATCH', 'DELETE'])('blocks cross-site cookie %s', async (method) => {
    const { next } = await run({
      method,
      headers: { origin: evil },
      cookies: { accessToken: signAccessToken(payload) },
    });
    expect(errorOf(next)?.status).toBe(403);
  });

  it('allows a cookie-authenticated POST from our own origin', async () => {
    const { next, req } = await run({
      method: 'POST',
      headers: { origin: ours },
      cookies: { accessToken: signAccessToken(payload) },
    });
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual(expect.objectContaining(payload));
  });

  it('allows cookie-authenticated reads from anywhere (CORS still hides the response)', async () => {
    const { next } = await run({
      method: 'GET',
      headers: { origin: evil },
      cookies: { accessToken: signAccessToken(payload) },
    });
    expect(next).toHaveBeenCalledWith();
  });

  it('allows bearer-authenticated writes regardless of origin', async () => {
    const { next } = await run({
      method: 'POST',
      headers: { origin: evil, authorization: `Bearer ${signAccessToken(payload)}` },
    });
    expect(next).toHaveBeenCalledWith();
  });

  it('allows non-browser clients that send no Origin', async () => {
    const { next } = await run({
      method: 'POST',
      cookies: { accessToken: signAccessToken(payload) },
    });
    expect(next).toHaveBeenCalledWith();
  });
});
