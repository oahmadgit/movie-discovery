import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Invalid request parameters', details: err.issues });
  }

  res.status(500).json({ error: 'Internal server error' });
}
