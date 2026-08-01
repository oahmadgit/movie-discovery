import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let instance: Database.Database | null = null;

export function getDb(dbPath = path.resolve(__dirname, '../../../../database/movies.db')): Database.Database {
  if (instance) return instance;

  instance = new Database(dbPath);
  instance.pragma('journal_mode = WAL');
  instance.pragma('foreign_keys = ON');

  const schema = readFileSync(path.resolve(__dirname, 'schema.sql'), 'utf-8');
  instance.exec(schema);

  return instance;
}
