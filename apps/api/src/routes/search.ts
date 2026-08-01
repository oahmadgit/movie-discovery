import { Router } from 'express';
import type Database from 'better-sqlite3';
import { SearchService } from '../services/SearchService.js';
import { validateQuery } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { SearchQuerySchema, type SearchQuery } from '../validators/schemas.js';

export function searchRouter(db: Database.Database): Router {
  const router = Router();
  const searchService = new SearchService(db);

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
