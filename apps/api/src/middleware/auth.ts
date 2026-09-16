import type { NextFunction, Request, Response } from 'express';
import { unauthorized, forbidden } from '../utils/http.js';
import { verifyAccessToken } from '../utils/jwt.js';

function headerValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function bearerFromAuthorization(header: string | string[] | undefined): string | undefined {
  const raw = headerValue(header);
  if (!raw) return undefined;
  const match = raw.match(/^Bearer\s+(\S+)/i);
  return match?.[1];
}

/** Access tokens may arrive as Bearer, query (`?token=` for SSE), or cookie. */
export function tokenCandidates(req: Request): string[] {
  const bearer = bearerFromAuthorization(req.headers.authorization);
  const queryToken = typeof req.query.token === 'string' ? req.query.token : undefined;
  const cookieToken =
    typeof req.cookies?.accessToken === 'string' ? req.cookies.accessToken : undefined;

  const seen = new Set<string>();
  const tokens: string[] = [];
  for (const candidate of [bearer, queryToken, cookieToken]) {
    const token = candidate?.trim();
    if (!token || seen.has(token)) continue;
    seen.add(token);
    tokens.push(token);
  }
  return tokens;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const tokens = tokenCandidates(req);
  if (tokens.length === 0) return next(unauthorized('Authentication required'));

  for (const token of tokens) {
    try {
      req.user = verifyAccessToken(token);
      return next();
    } catch {
      /* try the next source — a stale Bearer must not hide a valid cookie */
    }
  }

  next(unauthorized('Invalid or expired token'));
}

export const requireRole =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(unauthorized());
    if (roles.length && !roles.includes(req.user.role)) return next(forbidden());
    next();
  };
