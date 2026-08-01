import { createLogger } from '@movie-discovery/shared';

// One shared instance for the whole API package — app.ts, index.ts, and
// errorHandler.ts all import this rather than each calling createLogger()
// themselves, so log lines are tagged consistently and there's only one
// pino instance per process.
export const logger = createLogger('api');
