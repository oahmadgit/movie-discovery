import { Router } from 'express';
import type Database from 'better-sqlite3';
import { MovieService } from '../services/MovieService.js';
import { SimilarityService } from '../services/SimilarityService.js';
import { validateParams, validateQuery } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { IdParamSchema, MoviesQuerySchema, type MoviesQuery } from '../validators/schemas.js';

export function moviesRouter(db: Database.Database): Router {
  const router = Router();
  const movieService = new MovieService(db);
  const similarityService = new SimilarityService(db);

  router.get(
    '/',
    validateQuery(MoviesQuerySchema),
    asyncHandler((_req, res) => {
      const query = res.locals.query as MoviesQuery;
      res.json(movieService.list(query));
    })
  );

  router.get(
    '/:id',
    validateParams(IdParamSchema),
    asyncHandler((_req, res) => {
      const { id } = res.locals.params as { id: number };
      const movie = movieService.getById(id);
      if (!movie) return res.status(404).json({ error: 'Movie not found' });
      res.json(movie);
    })
  );

  router.get(
    '/:id/similar',
    validateParams(IdParamSchema),
    asyncHandler((_req, res) => {
      const { id } = res.locals.params as { id: number };
      res.json(similarityService.getSimilar(id));
    })
  );

  return router;
}
