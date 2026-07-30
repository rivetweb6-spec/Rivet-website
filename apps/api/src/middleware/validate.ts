import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';
import { badRequest } from '../utils/http.js';

type Schemas = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

export const validate =
  (schemas: Schemas) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      // Express 5 exposes req.query / req.params as read-only getters, so we
      // must redefine them to persist parsed values (defaults, coercions).
      if (schemas.query) {
        const parsed = schemas.query.parse(req.query);
        Object.defineProperty(req, 'query', { value: parsed, writable: true, configurable: true });
      }
      if (schemas.params) {
        const parsed = schemas.params.parse(req.params);
        Object.defineProperty(req, 'params', { value: parsed, writable: true, configurable: true });
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(badRequest('Validation failed', err.flatten()));
      } else {
        next(err);
      }
    }
  };
