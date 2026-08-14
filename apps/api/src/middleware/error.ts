import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import * as Sentry from '@sentry/node';
import { ApiError } from '../utils/http.js';
import { sentryEnabled } from '../instrument.js';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, 'Route not found'));
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Image is too large. Maximum size is 8 MB.'
        : err.message;
    return res.status(400).json({ error: message });
  }
  if (sentryEnabled) Sentry.captureException(err);
  console.error('Unhandled error:', err);
  return res.status(500).json({ error: 'Internal server error' });
}
