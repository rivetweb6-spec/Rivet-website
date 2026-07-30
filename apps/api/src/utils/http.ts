import type { NextFunction, Request, Response } from 'express';

/** Read a route param as a plain string (Express 5 types it as string | string[]). */
export const param = (req: Request, key: string): string => {
  const value = req.params[key];
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
};

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const notFound = (msg = 'Resource not found') => new ApiError(404, msg);
export const unauthorized = (msg = 'Unauthorized') => new ApiError(401, msg);
export const forbidden = (msg = 'Forbidden') => new ApiError(403, msg);
export const badRequest = (msg = 'Bad request', details?: unknown) =>
  new ApiError(400, msg, details);

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export const asyncHandler =
  (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
