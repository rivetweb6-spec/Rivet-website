import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { Prisma } from '@prisma/client';
import * as Sentry from '@sentry/node';
import { ApiError } from '../utils/http.js';
import { sentryEnabled } from '../instrument.js';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, 'Route not found'));
}

/**
 * Prisma throws for conditions that are really client errors — updating or
 * deleting a row that does not exist, pointing a foreign key at a missing
 * parent, reusing a unique value. Without this mapping every one of those
 * surfaces to the admin UI as an opaque 500.
 */
function fromPrisma(err: unknown): ApiError | null {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const meta = err.meta as { target?: unknown; field_name?: unknown } | undefined;
    const field = Array.isArray(meta?.target)
      ? meta.target.join(', ')
      : typeof meta?.target === 'string'
        ? meta.target
        : typeof meta?.field_name === 'string'
          ? meta.field_name
          : undefined;

    switch (err.code) {
      case 'P2025':
        return new ApiError(404, 'Record not found');
      case 'P2002':
        return new ApiError(
          409,
          field ? `A record with this ${field} already exists` : 'This value is already in use',
        );
      case 'P2003':
      case 'P2014':
        return new ApiError(
          400,
          field
            ? `Related record referenced by "${field}" does not exist`
            : 'A related record referenced by this request does not exist',
        );
      case 'P2000':
        return new ApiError(400, 'One of the submitted values is too long');
      default:
        return null;
    }
  }
  if (err instanceof Prisma.PrismaClientValidationError) {
    return new ApiError(400, 'Invalid request data');
  }
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return new ApiError(503, 'Database is unavailable. Please try again shortly.');
  }
  return null;
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
        ? 'File is too large. Maximum size is 8 MB.'
        : err.message;
    return res.status(400).json({ error: message });
  }
  const mapped = fromPrisma(err);
  if (mapped) {
    if (mapped.status >= 500 && sentryEnabled) Sentry.captureException(err);
    return res.status(mapped.status).json({ error: mapped.message });
  }
  if (sentryEnabled) Sentry.captureException(err);
  console.error('Unhandled error:', err);
  return res.status(500).json({ error: 'Internal server error' });
}
