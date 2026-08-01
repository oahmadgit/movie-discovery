import { describe, it, expect } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createApp } from '../src/app.js';
import { seedTestDb } from './helpers/seedTestDb.js';

const db = new Database(':memory:');
seedTestDb(db);
const app = createApp({ db });

describe('GET /api/search', () => {
  it('returns matches ranked by relevance', async () => {
    const res = await request(app).get('/api/search?q=shawshank');
    expect(res.status).toBe(200);
    expect(res.body[0].title).toBe('The Shawshank Redemption');
  });

  it('matches on overview text, not just title', async () => {
    const res = await request(app).get('/api/search?q=patriarch');
    expect(res.status).toBe(200);
    expect(res.body.map((m: any) => m.id)).toContain(238);
  });

  it('returns [] for an empty query instead of an error', async () => {
    const res = await request(app).get('/api/search?q=');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns [] when q is omitted entirely', async () => {
    const res = await request(app).get('/api/search');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns [] for no matches rather than 404', async () => {
    const res = await request(app).get('/api/search?q=nonexistentmovietitlexyz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('handles FTS special characters without crashing', async () => {
    const res = await request(app).get('/api/search?q=' + encodeURIComponent('"badly formed*(query)-'));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
