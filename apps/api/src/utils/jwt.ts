import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type JwtPayload = { sub: string; role: string };

/** Seconds of leeway for clock skew between the API host and the admin browser. */
const CLOCK_TOLERANCE_SEC = 30;

function sign(payload: JwtPayload, secret: string, ttlSeconds: number): string {
  return jwt.sign(payload, secret, { expiresIn: ttlSeconds });
}

export function signAccessToken(payload: JwtPayload): string {
  return sign(payload, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_TTL);
}

export function signRefreshToken(payload: JwtPayload): string {
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
