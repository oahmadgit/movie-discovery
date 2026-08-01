import { Router } from 'express';
import type Database from 'better-sqlite3';
import { AnalyticsService } from '../services/AnalyticsService.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export function analyticsRouter(db: Database.Database): Router {
  const router = Router();
  const analyticsService = new AnalyticsService(db);

  router.get(
    '/top-genres',
    asyncHandler((_req, res) => {
      res.json(analyticsService.topGenres());
    })
  );

  return router;
}
