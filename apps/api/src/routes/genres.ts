import { Router } from 'express';
import type { Repositories } from '../repositories/index.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export function genresRouter(repos: Repositories): Router {
  const router = Router();

  router.get(
    '/',
    asyncHandler((_req, res) => {
      res.json(repos.genres.findDistinctNames());
    })
  );

  return router;
}
