import { Router } from 'express';
import type Database from 'better-sqlite3';
import { MovieService } from '../services/MovieService.js';
import { SimilarityService } from '../services/SimilarityService.js';
import { validateParams, validateQuery } from '../middleware/validate.js';
import { IdParamSchema, MoviesQuerySchema, type MoviesQuery } from '../validators/schemas.js';

export function moviesRouter(db: Database.Database): Router {
  const router = Router();
  const movieService = new MovieService(db);
  const similarityService = new SimilarityService(db);

  router.get('/', validateQuery(MoviesQuerySchema), (_req, res, next) => {
    try {
      const query = res.locals.query as MoviesQuery;
      res.json(movieService.list(query));
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', validateParams(IdParamSchema), (_req, res, next) => {
    try {
      const { id } = res.locals.params as { id: number };
      const movie = movieService.getById(id);
      if (!movie) return res.status(404).json({ error: 'Movie not found' });
      res.json(movie);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id/similar', validateParams(IdParamSchema), (_req, res, next) => {
    try {
      const { id } = res.locals.params as { id: number };
      res.json(similarityService.getSimilar(id));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
