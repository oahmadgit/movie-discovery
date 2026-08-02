import type { CastMember, CrewMember } from '../types/domain.js';

export interface CastCrewRepository {
  findCastByMovieId(movieId: number, limit: number): CastMember[];
  findCrewByMovieId(movieId: number, jobs: string[]): CrewMember[];
}
