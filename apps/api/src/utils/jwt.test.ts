import { describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from './jwt.js';

const payload = { sub: 'user-1', role: 'ADMIN' };

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
