import { Router } from 'express';
import type Database from 'better-sqlite3';
import { SearchService } from '../services/SearchService.js';

export function searchRouter(db: Database.Database): Router {
  const router = Router();
  const searchService = new SearchService(db);

  router.get('/', (req, res, next) => {
    try {
      const q = String(req.query.q ?? '');
      res.json(searchService.search(q));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
