import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createApp } from '../src/app.js';
import { seedTestDb } from './helpers/seedTestDb.js';

const db = new Database(':memory:');
seedTestDb(db);
const app = createApp({ db });

describe('GET /api/movies', () => {
  it('returns paginated results with default params', async () => {
    const res = await request(app).get('/api/movies');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('pagination');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('returns 400 for invalid sort column', async () => {
    const res = await request(app).get('/api/movies?sort=injected_column');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/movies/:id', () => {
  it('returns full movie detail for a valid id', async () => {
    const res = await request(app).get('/api/movies/278');
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('The Shawshank Redemption');
  });

  it('returns 404 for a non-existent id', async () => {
    const res = await request(app).get('/api/movies/999999999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
