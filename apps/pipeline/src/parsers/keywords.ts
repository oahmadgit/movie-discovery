import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';
import { parseJsonColumn } from './movies.js';

export interface KeywordRow {
  movie_id: number;
  keyword_id: number;
  name: string;
}

interface RawKeywordEntry {
  id?: unknown;
  name?: unknown;
}

function isKeywordEntry(k: RawKeywordEntry): k is RawKeywordEntry & { id: number; name: string } {
  return typeof k?.id === 'number' && typeof k?.name === 'string';
}

export function parseKeywordsColumn(movieId: number, raw: string): { keywords: KeywordRow[]; skipped: number } {
  const entries = parseJsonColumn(raw) as RawKeywordEntry[];
  const valid = entries.filter(isKeywordEntry);
  const keywords = valid.map((k) => ({
    movie_id: movieId,
    keyword_id: k.id,
    name: k.name,
  }));
  return { keywords, skipped: entries.length - valid.length };
}

export function parseKeywordsCsv(filePath: string): { keywords: KeywordRow[]; skipped: number } {
  const raw = readFileSync(filePath, 'utf-8');
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  const keywords: KeywordRow[] = [];
  let skipped = 0;

  for (const row of records) {
    const movieId = Number(row.id);
    if (!Number.isInteger(movieId)) continue;
    const result = parseKeywordsColumn(movieId, row.keywords);
    keywords.push(...result.keywords);
    skipped += result.skipped;
  }

  return { keywords, skipped };
}
