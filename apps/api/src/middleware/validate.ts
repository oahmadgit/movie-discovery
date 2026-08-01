import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny, TypeOf } from 'zod';

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
