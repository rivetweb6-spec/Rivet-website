import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Claims carried by access and refresh tokens. `sid` is the server-side
 * Session the token belongs to; tokens without one (issued before sessions
 * existed) are rejected by requireAuth / refresh.
 */
export type JwtPayload = { sub: string; role: string; sid?: string };

/** What we sign — every new token belongs to a session. */
export type SessionClaims = { sub: string; role: string; sid: string };

/** Seconds of leeway for clock skew between the API host and the admin browser. */
const CLOCK_TOLERANCE_SEC = 30;

function sign(payload: SessionClaims, secret: string, ttlSeconds: number): string {
  return jwt.sign({ sub: payload.sub, role: payload.role, sid: payload.sid }, secret, {
    expiresIn: ttlSeconds,
  });
}

export function signAccessToken(payload: SessionClaims): string {
  return sign(payload, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_TTL);
}

export function signRefreshToken(payload: SessionClaims): string {
  return sign(payload, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_TTL);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    clockTolerance: CLOCK_TOLERANCE_SEC,
  }) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    clockTolerance: CLOCK_TOLERANCE_SEC,
  }) as JwtPayload;
}

/**
 * Session id from a genuine token, even if it has expired — used only by
 * logout, so a user whose access token just lapsed can still end the session.
 * The signature is always checked.
 */
export function sessionIdFromToken(token: string, kind: 'access' | 'refresh'): string | undefined {
  try {
    const secret = kind === 'access' ? env.JWT_ACCESS_SECRET : env.JWT_REFRESH_SECRET;
    const payload = jwt.verify(token, secret, { ignoreExpiration: true }) as JwtPayload;
    return typeof payload.sid === 'string' ? payload.sid : undefined;
  } catch {
    return undefined;
  }
}
