import type { TopGenreStat } from '../types/domain.js';

export interface AnalyticsRepository {
  topGenresByDecade(): TopGenreStat[];
}
