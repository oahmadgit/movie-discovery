import type { TopGenreStat } from '../types/domain.js';
import type { AnalyticsRepository } from '../repositories/AnalyticsRepository.js';

export class AnalyticsService {
  constructor(private analytics: AnalyticsRepository) {}

  topGenres(): TopGenreStat[] {
    return this.analytics.topGenresByDecade();
  }
}
