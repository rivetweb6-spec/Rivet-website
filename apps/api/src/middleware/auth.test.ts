import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/http.js';
import { signAccessToken } from '../utils/jwt.js';
import { requireAuth, tokenCandidates } from './auth.js';

const payload = { sub: 'user-1', role: 'ADMIN' };

function expiredAccess() {
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign({ ...payload, iat: now - 120, exp: now - 60 }, env.JWT_ACCESS_SECRET);
}

function run(req: Partial<Request>) {
  const next = vi.fn() as unknown as NextFunction;
  const full = {
    headers: {},
    query: {},
    cookies: {},
    ...req,
  } as Request;
  requireAuth(full, {} as Response, next);
  return { next, req: full };
}

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
  it('accepts a valid bearer token', () => {
    const token = signAccessToken(payload);
    const { next, req } = run({
      headers: { authorization: `Bearer ${token}` },
    });
    expect(req.user).toEqual(expect.objectContaining(payload));
    expect(next).toHaveBeenCalledWith();
  });

  it('falls back to a valid cookie when bearer is expired', () => {
    const fresh = signAccessToken(payload);
    const { next, req } = run({
      headers: { authorization: `Bearer ${expiredAccess()}` },
      cookies: { accessToken: fresh },
    });
    expect(req.user).toEqual(expect.objectContaining(payload));
    expect(next).toHaveBeenCalledWith();
  });

  it('rejects when every token is expired', () => {
    const { next } = run({
      headers: { authorization: `Bearer ${expiredAccess()}` },
    });
    const err = (next as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(401);
    expect(err.message).toBe('Invalid or expired token');
  });

  it('asks for authentication when no token is present', () => {
    const { next } = run({});
    const err = (next as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as ApiError;
    expect(err.message).toBe('Authentication required');
  });
});
