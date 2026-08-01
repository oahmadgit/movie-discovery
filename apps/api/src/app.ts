import express from 'express';
import cors from 'cors';
import type Database from 'better-sqlite3';
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

  const db = options.db ?? createDb(options.dbPath);

  app.use('/api/movies', moviesRouter(db));
  app.use('/api/search', searchRouter(db));
  app.use('/api/analytics', analyticsRouter(db));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use(errorHandler);
  return app;
}
