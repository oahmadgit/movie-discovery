import { describe, it, expect } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createApp } from '../src/app.js';
import { seedTestDb } from './helpers/seedTestDb.js';

const db = new Database(':memory:');
seedTestDb(db);
const app = createApp({ db });

describe('GET /api/genres', () => {
  it('returns distinct genre names sorted alphabetically', async () => {
    const res = await request(app).get('/api/genres');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(['Crime', 'Drama']);
  });
});
