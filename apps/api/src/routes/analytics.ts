import { Router } from 'express';
import type { Repositories } from '../repositories/index.js';
import { AnalyticsService } from '../services/AnalyticsService.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export function analyticsRouter(repos: Repositories): Router {
  const router = Router();
  const analyticsService = new AnalyticsService(repos.analytics);

  router.get(
    '/top-genres',
    asyncHandler((_req, res) => {
      res.json(analyticsService.topGenres());
    })
  );

  return router;
}
