import { describe, it, expect } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createApp } from '../src/app.js';
import { seedTestDb } from './helpers/seedTestDb.js';

describe('Failure conditions', () => {
  it('returns 500 for every /api route when the database path is invalid', async () => {
    const brokenApp = createApp({ dbPath: 'C:/nonexistent-dir-xyz/db.sqlite' });
    const res = await request(brokenApp).get('/api/movies');
    expect(res.status).toBe(500);
  });

  it('returns 400 for malformed query params', async () => {
    const db = new Database(':memory:');
    seedTestDb(db);
    const app = createApp({ db });

    const res = await request(app).get('/api/movies?page=not_a_number');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 404 (not 500) for an id that cannot possibly exist', async () => {
    const db = new Database(':memory:');
    seedTestDb(db);
    const app = createApp({ db });

    const res = await request(app).get('/api/movies/999999999');
    expect(res.status).toBe(404);
  });

  it('search with empty query returns empty array not an error', async () => {
    const db = new Database(':memory:');
    seedTestDb(db);
    const app = createApp({ db });

    const res = await request(app).get('/api/search?q=');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('handles FTS special characters without crashing', async () => {
    const db = new Database(':memory:');
    seedTestDb(db);
    const app = createApp({ db });

    const res = await request(app).get('/api/search?q=' + encodeURIComponent('"badly formed*'));
    expect(res.status).toBe(200);
  });
});
