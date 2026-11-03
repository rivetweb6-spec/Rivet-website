import { describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from './jwt.js';

const payload = { sub: 'user-1', role: 'ADMIN', sid: 'session-1' };

describe('jwt helpers', () => {
  it('round-trips an access token', () => {
    const token = signAccessToken(payload);
    expect(verifyAccessToken(token)).toEqual(expect.objectContaining(payload));
  });

  it('round-trips a refresh token', () => {
    const token = signRefreshToken(payload);
    expect(verifyRefreshToken(token)).toEqual(expect.objectContaining(payload));
  });

  it('rejects an expired access token', () => {
    const now = Math.floor(Date.now() / 1000);
    const token = jwt.sign({ ...payload, iat: now - 120, exp: now - 60 }, env.JWT_ACCESS_SECRET);
    expect(() => verifyAccessToken(token)).toThrow();
  });

  it('does not accept a refresh token as an access token', () => {
    const token = signRefreshToken(payload);
    expect(() => verifyAccessToken(token)).toThrow();
  });
});

describe('sessionIdFromToken', () => {
  it('reads the session id from an expired but genuine token (for logout)', async () => {
    const { sessionIdFromToken } = await import('./jwt.js');
    const now = Math.floor(Date.now() / 1000);
    const expired = jwt.sign({ ...payload, iat: now - 120, exp: now - 60 }, env.JWT_ACCESS_SECRET);
    expect(sessionIdFromToken(expired, 'access')).toBe('session-1');
  });

  it('ignores tokens with a bad signature or the wrong kind', async () => {
    const { sessionIdFromToken } = await import('./jwt.js');
    const forged = jwt.sign(payload, 'not-the-secret');
    expect(sessionIdFromToken(forged, 'access')).toBeUndefined();
    expect(sessionIdFromToken(signRefreshToken(payload), 'access')).toBeUndefined();
    expect(sessionIdFromToken(signRefreshToken(payload), 'refresh')).toBe('session-1');
  });
});
