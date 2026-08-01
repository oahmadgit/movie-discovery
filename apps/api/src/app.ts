import express from 'express';
import cors from 'cors';
import type Database from 'better-sqlite3';
import { logger } from './logger.js';
import { createDb } from './db/connection.js';
import { moviesRouter } from './routes/movies.js';
import { searchRouter } from './routes/search.js';
import { analyticsRouter } from './routes/analytics.js';
import { errorHandler } from './middleware/errorHandler.js';

export interface CreateAppOptions {
  dbPath?: string;
  db?: Database.Database;
}

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // better-sqlite3 opens the file synchronously in its constructor, so a bad
  // path throws here rather than on the first query. Degrade to a 500 on every
  // /api/* route instead of letting app creation itself throw — callers that
  // already handle HTTP error responses shouldn't also need to catch createApp().
  try {
    const db = options.db ?? createDb(options.dbPath);
    app.use('/api/movies', moviesRouter(db));
    app.use('/api/search', searchRouter(db));
    app.use('/api/analytics', analyticsRouter(db));
  } catch (err) {
    logger.error({ err }, 'Failed to open database');
    app.use('/api', (_req, res) => res.status(500).json({ error: 'Internal server error' }));
  }

  app.use(errorHandler);
  return app;
}
