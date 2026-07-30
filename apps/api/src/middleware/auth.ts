import type { NextFunction, Request, Response } from 'express';
import { unauthorized, forbidden } from '../utils/http.js';
import { verifyAccessToken } from '../utils/jwt.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  const queryToken =
    typeof req.query.token === 'string' ? req.query.token : undefined;
  const token =
    bearer ?? queryToken ?? (req.cookies?.accessToken as string | undefined);

  if (!token) return next(unauthorized('Authentication required'));
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(unauthorized('Invalid or expired token'));
  }
}

export const requireRole =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(unauthorized());
    if (roles.length && !roles.includes(req.user.role)) return next(forbidden());
    next();
  };
