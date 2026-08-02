import express from 'express';
import cors from 'cors';
import type Database from 'better-sqlite3';
import { logger } from './logger.js';
import { createDb } from './db/connection.js';
import { createRepositories } from './repositories/index.js';
import { moviesRouter } from './routes/movies.js';
import { searchRouter } from './routes/search.js';
import { analyticsRouter } from './routes/analytics.js';
import { genresRouter } from './routes/genres.js';
import { errorHandler } from './middleware/errorHandler.js';

export interface CreateAppOptions {
  dbPath?: string;
  db?: Database.Database;
}

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  let db: Database.Database | undefined;
  try {
    db = options.db ?? createDb(options.dbPath);
    const repos = createRepositories(db);
    app.use('/api/movies', moviesRouter(repos));
    app.use('/api/search', searchRouter(repos));
    app.use('/api/analytics', analyticsRouter(repos));
    app.use('/api/genres', genresRouter(repos));
  } catch (err) {
    logger.error({ err }, 'Failed to open database');
    app.use('/api', (_req, res) => res.status(500).json({ error: 'Internal server error' }));
  }

  app.get('/health', (_req, res) => {
    if (!db) return res.status(503).json({ status: 'error', error: 'database unavailable' });
    res.json({ status: 'ok' });
  });

  app.use(errorHandler);
  return app;
}
