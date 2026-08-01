import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';
import { parseJsonColumn } from './movies.js';

export interface KeywordRow {
  movie_id: number;
  keyword_id: number;
  name: string;
}

export function parseKeywordsColumn(movieId: number, raw: string): KeywordRow[] {
  return (parseJsonColumn(raw) as any[])
    .filter((k) => typeof k?.id === 'number' && typeof k?.name === 'string')
    .map((k) => ({
      movie_id: movieId,
      keyword_id: k.id,
      name: k.name,
    }));
}

export function parseKeywordsCsv(filePath: string): KeywordRow[] {
  const raw = readFileSync(filePath, 'utf-8');
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  const keywords: KeywordRow[] = [];

  for (const row of records) {
    const movieId = Number(row.id);
    if (!Number.isInteger(movieId)) continue;
    keywords.push(...parseKeywordsColumn(movieId, row.keywords));
  }

  return keywords;
}
