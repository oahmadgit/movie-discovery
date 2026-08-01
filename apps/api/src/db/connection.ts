import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_DB_PATH = path.resolve(__dirname, '../../../../database/movies.db');

export function createDb(dbPath: string = DEFAULT_DB_PATH): Database.Database {
  return new Database(dbPath);
}
