import { Router } from 'express';
import type Database from 'better-sqlite3';
import { AnalyticsService } from '../services/AnalyticsService.js';

export function analyticsRouter(db: Database.Database): Router {
  const router = Router();
  const analyticsService = new AnalyticsService(db);

  router.get('/top-genres', (_req, res, next) => {
    try {
      res.json(analyticsService.topGenres());
    } catch (err) {
      next(err);
    }
  });

  return router;
}
