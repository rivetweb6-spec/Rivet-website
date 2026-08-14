import { describe, it, expect, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import {
  ApiError,
  asyncHandler,
  badRequest,
  conflict,
  forbidden,
  notFound,
  param,
  unauthorized,
} from './http.js';

describe('param', () => {
  it('reads a plain string route param', () => {
    const req = { params: { slug: 'elevators' } } as unknown as Request;
    expect(param(req, 'slug')).toBe('elevators');
  });

  it('returns the first entry when the param is an array', () => {
    const req = { params: { id: ['a', 'b'] } } as unknown as Request;
    expect(param(req, 'id')).toBe('a');
  });

  it('returns an empty string for a missing param', () => {
    const req = { params: {} } as unknown as Request;
    expect(param(req, 'missing')).toBe('');
  });
});

describe('ApiError factories', () => {
  it('builds status-specific errors', () => {
    expect(notFound()).toMatchObject({ status: 404 });
    expect(unauthorized()).toMatchObject({ status: 401 });
    expect(forbidden()).toMatchObject({ status: 403 });
    expect(badRequest('bad', { field: 'email' })).toMatchObject({
      status: 400,
      message: 'bad',
      details: { field: 'email' },
    });
    expect(conflict('in use', { productCount: 3 })).toMatchObject({
      status: 409,
      message: 'in use',
      details: { productCount: 3 },
    });
  });

  it('is an instance of Error and ApiError', () => {
    const err = notFound('nope');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe('nope');
  });
});

describe('asyncHandler', () => {
  it('forwards resolved handlers without calling next', async () => {
    const next = vi.fn() as unknown as NextFunction;
    const handler = asyncHandler(async (_req, res) => {
      (res as Response).statusCode = 200;
    });
    const res = {} as Response;
    await handler({} as Request, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('passes thrown errors to next', async () => {
    const next = vi.fn() as unknown as NextFunction;
    const boom = new ApiError(500, 'boom');
    const handler = asyncHandler(async () => {
      throw boom;
    });
    await handler({} as Request, {} as Response, next);
    expect(next).toHaveBeenCalledWith(boom);
  });
});
