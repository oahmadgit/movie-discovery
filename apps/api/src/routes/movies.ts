import { Router } from 'express';
import type Database from 'better-sqlite3';
import { MovieService } from '../services/MovieService.js';
import { SimilarityService } from '../services/SimilarityService.js';

const SORT_COLUMNS = ['title', 'release_date', 'vote_average', 'revenue'];

export function moviesRouter(db: Database.Database): Router {
  const router = Router();
  const movieService = new MovieService(db);
  const similarityService = new SimilarityService(db);

  router.get('/', (req, res, next) => {
    try {
      const { sort } = req.query;
      if (sort && !SORT_COLUMNS.includes(String(sort))) {
        return res.status(400).json({ error: 'Invalid sort column' });
      }

      const result = movieService.list({
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        sort: sort as any,
        order: req.query.order as any,
        genre: req.query.genre as string | undefined,
        yearFrom: req.query.yearFrom ? Number(req.query.yearFrom) : undefined,
        yearTo: req.query.yearTo ? Number(req.query.yearTo) : undefined,
        minVotes: req.query.minVotes ? Number(req.query.minVotes) : undefined,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', (req, res, next) => {
    try {
      const movie = movieService.getById(Number(req.params.id));
      if (!movie) return res.status(404).json({ error: 'Movie not found' });
      res.json(movie);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id/similar', (req, res, next) => {
    try {
      const similar = similarityService.getSimilar(Number(req.params.id));
      res.json(similar);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
