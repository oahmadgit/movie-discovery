import { Router } from 'express';
import type { Repositories } from '../repositories/index.js';
import { SearchService } from '../services/SearchService.js';
import { validateQuery } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { SearchQuerySchema, type SearchQuery } from '../validators/schemas.js';

export function searchRouter(repos: Repositories): Router {
  const router = Router();
  const searchService = new SearchService(repos.movies, repos.genres);

  router.get(
    '/',
    validateQuery(SearchQuerySchema),
    asyncHandler((_req, res) => {
      const { q, limit } = res.locals.query as SearchQuery;
      res.json(searchService.search(q, limit));
    })
  );

  return router;
}
