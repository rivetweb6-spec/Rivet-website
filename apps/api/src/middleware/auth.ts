import type { NextFunction, Request, Response } from 'express';
import { unauthorized, forbidden } from '../utils/http.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { allowedOrigins } from '../config/env.js';
import { isAllowedOrigin } from '../config/origins.js';
import { isSessionActive } from '../modules/auth/sessions.js';

function headerValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function bearerFromAuthorization(header: string | string[] | undefined): string | undefined {
  const raw = headerValue(header);
  if (!raw) return undefined;
  const match = raw.match(/^Bearer\s+(\S+)/i);
  return match?.[1];
}

type TokenSource = 'bearer' | 'query' | 'cookie';

/** Access tokens may arrive as Bearer, query (`?token=` for SSE), or cookie. */
function tokenSources(req: Request): { token: string; source: TokenSource }[] {
  const queryToken = typeof req.query.token === 'string' ? req.query.token : undefined;
  const cookieToken =
    typeof req.cookies?.accessToken === 'string' ? req.cookies.accessToken : undefined;
  const raw: [string | undefined, TokenSource][] = [
    [bearerFromAuthorization(req.headers.authorization), 'bearer'],
    [queryToken, 'query'],
    [cookieToken, 'cookie'],
  ];

  const seen = new Set<string>();
  const out: { token: string; source: TokenSource }[] = [];
  for (const [candidate, source] of raw) {
    const token = candidate?.trim();
    if (!token || seen.has(token)) continue;
    seen.add(token);
    out.push({ token, source });
  }
  return out;
}

export function tokenCandidates(req: Request): string[] {
  return tokenSources(req).map((t) => t.token);
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Cookies are sent with cross-site requests (SameSite=None is needed because
 * the web app and API live on different sites), so a hostile page could
 * submit a form that rides the admin's cookie. A browser always attaches an
 * Origin header to such a request; when a cookie is the only credential for
 * a state-changing request, that Origin must be one of ours. Bearer tokens
 * are immune — another site cannot read or attach them.
 */
export function isCrossSiteCookieWrite(req: Request, source: TokenSource): boolean {
  if (source !== 'cookie' || SAFE_METHODS.has(req.method)) return false;
  const origin = headerValue(req.headers.origin);
  if (!origin) return false; // non-browser client; it cannot borrow a victim's cookie
  return !isAllowedOrigin(allowedOrigins, origin);
}

/**
 * A valid signature is not enough: the token's session must still be active,
 * so logout, password changes and deleted users take effect immediately.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const tokens = tokenSources(req);
  if (tokens.length === 0) return next(unauthorized('Authentication required'));

  try {
    for (const { token, source } of tokens) {
      let user;
      try {
        user = verifyAccessToken(token);
      } catch {
        continue; // try the next source — a stale Bearer must not hide a valid cookie
      }
      if (!user.sid || !(await isSessionActive(user.sid, user.sub))) {
        continue; // signed, but its session has ended (or predates sessions)
      }
      if (isCrossSiteCookieWrite(req, source)) {
        return next(forbidden('Cross-site request blocked'));
      }
      req.user = user;
      return next();
    }
  } catch (err) {
    return next(err);
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
