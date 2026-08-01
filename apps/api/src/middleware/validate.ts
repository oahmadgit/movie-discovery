import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny, TypeOf } from 'zod';

// Zod-validated req.query/req.params are attached to res.locals instead of
// overwriting req.query/req.params, since Express 4's typings for those are
// not designed to hold arbitrary parsed shapes.
export function validateQuery<T extends ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      res.locals.query = schema.parse(req.query) as TypeOf<T>;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function validateParams<T extends ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      res.locals.params = schema.parse(req.params) as TypeOf<T>;
      next();
    } catch (err) {
      next(err);
    }
  };
}
