import type Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Reuses the pipeline's schema so the in-memory test DB matches production shape.
const SCHEMA_PATH = path.resolve(__dirname, '../../../pipeline/src/db/schema.sql');

export function seedTestDb(db: Database.Database) {
  db.exec(readFileSync(SCHEMA_PATH, 'utf-8'));

  db.prepare(
    `INSERT INTO movies (id, title, overview, release_date, release_year, vote_average, vote_count)
     VALUES (278, 'The Shawshank Redemption', 'Two imprisoned men bond...', '1994-09-23', 1994, 8.7, 21000)`
  ).run();

  db.prepare(`INSERT INTO genres (movie_id, genre_id, name) VALUES (278, 18, 'Drama')`).run();
}
