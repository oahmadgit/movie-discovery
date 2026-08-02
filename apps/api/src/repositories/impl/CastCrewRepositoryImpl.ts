import type Database from 'better-sqlite3';
import type { CastMember, CrewMember } from '../../types/domain.js';
import type { CastCrewRepository } from '../CastCrewRepository.js';

export class CastCrewRepositoryImpl implements CastCrewRepository {
  constructor(private db: Database.Database) {}

  findCastByMovieId(movieId: number, limit: number): CastMember[] {
    return this.db
      .prepare(
        `SELECT person_id, name, character, "order"
         FROM cast_members WHERE movie_id = ?
         ORDER BY "order" LIMIT ?`
      )
      .all(movieId, limit) as CastMember[];
  }

  findCrewByMovieId(movieId: number, jobs: string[]): CrewMember[] {
    return this.db
      .prepare(
        `SELECT person_id, name, job, department
         FROM crew_members WHERE movie_id = ?
         AND job IN (${jobs.map(() => '?').join(',')})`
      )
      .all(movieId, ...jobs) as CrewMember[];
  }
}
