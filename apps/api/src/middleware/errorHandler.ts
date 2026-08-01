import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../logger.js';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  logger.error({ err, method: req.method, url: req.originalUrl }, err.message);

  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Invalid request parameters', details: err.issues });
  }

  res.status(500).json({ error: 'Internal server error' });
}
