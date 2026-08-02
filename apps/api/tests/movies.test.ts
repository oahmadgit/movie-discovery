import { describe, it, expect } from 'vitest';
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
    expect(res.body.pagination).toEqual({ page: 1, limit: 20, total: 3, totalPages: 1 });
  });

  it('includes poster_path on each movie, null when not available', async () => {
    const res = await request(app).get('/api/movies');
    const shawshank = res.body.data.find((m: any) => m.id === 278);
    const godfather = res.body.data.find((m: any) => m.id === 238);
    expect(shawshank.poster_path).toBe('/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg');
    expect(godfather.poster_path).toBeNull();
  });

  it('filters by a single genre', async () => {
    const res = await request(app).get('/api/movies?genres=Crime');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    res.body.data.forEach((m: any) => expect(m.genres.some((g: any) => g.name === 'Crime')).toBe(true));
  });

  it('filters by multiple genres with OR semantics', async () => {
    const res = await request(app).get('/api/movies?genres=Crime,Drama');
    expect(res.status).toBe(200);
    expect(res.body.data.map((m: any) => m.id).sort()).toEqual([238, 278, 550]);
  });

  it('filters by year range', async () => {
    const res = await request(app).get('/api/movies?yearFrom=1990&yearTo=1995');
    expect(res.status).toBe(200);
    expect(res.body.data.map((m: any) => m.id)).toEqual([278]);
  });

  it('filters by minRating', async () => {
    const res = await request(app).get('/api/movies?minRating=8.5');
    expect(res.status).toBe(200);
    expect(res.body.data.map((m: any) => m.id).sort()).toEqual([238, 278]);
  });

  it('sorts by vote_average descending', async () => {
    const res = await request(app).get('/api/movies?sort=vote_average&order=desc&limit=1');
    expect(res.status).toBe(200);
    expect(res.body.data[0].id).toBe(278);
  });

  it('returns 400 for invalid sort column', async () => {
    const res = await request(app).get('/api/movies?sort=injected_column');
    expect(res.status).toBe(400);
  });

  it('returns 400 for a non-numeric page', async () => {
    const res = await request(app).get('/api/movies?page=not_a_number');
    expect(res.status).toBe(400);
  });

  it('clamps limit to the 100 max via validation error above that', async () => {
    const res = await request(app).get('/api/movies?limit=1000');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/movies/:id', () => {
  it('returns full movie detail for a valid id', async () => {
    const res = await request(app).get('/api/movies/278');
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('The Shawshank Redemption');
    expect(res.body).toHaveProperty('genres');
    expect(res.body).toHaveProperty('cast');
    expect(res.body).toHaveProperty('crew');
    expect(res.body).toHaveProperty('keywords');
    expect(res.body).toHaveProperty('ratingStats');
    expect(res.body.cast[0]).toMatchObject({ name: 'Tim Robbins', character: 'Andy Dufresne' });
    expect(res.body.ratingStats).toMatchObject({ rating_count: 1, avg_rating: 5 });
  });

  it('returns 404 for a non-existent id', async () => {
    const res = await request(app).get('/api/movies/999999999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for a non-numeric id', async () => {
    const res = await request(app).get('/api/movies/not_a_number');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/movies/:id/similar', () => {
  it('returns movies sharing genres, most similar first', async () => {
    const res = await request(app).get('/api/movies/278/similar');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.map((m: any) => m.id)).toContain(238);
  });
});
