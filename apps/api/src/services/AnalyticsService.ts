import type Database from 'better-sqlite3';

export class AnalyticsService {
  constructor(private db: Database.Database) {}

  topGenres(): unknown[] {
    return this.db
      .prepare(
        `SELECT
           g.name AS genre,
           CAST((m.release_year / 10) * 10 AS TEXT) || 's' AS decade,
           COUNT(*) AS movie_count,
           ROUND(AVG(m.vote_average), 2) AS avg_rating,
           ROUND(AVG(NULLIF(m.revenue, 0))) AS avg_revenue
         FROM genres g
         JOIN movies m ON m.id = g.movie_id
         WHERE m.release_year IS NOT NULL
         GROUP BY g.name, decade
         ORDER BY decade, movie_count DESC`
      )
      .all();
  }
}
