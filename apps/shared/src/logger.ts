import pino from 'pino';

// Structured JSON in anything production-like, so logs stay machine-parseable
// behind a real deployment; colourised pretty output everywhere else, since
// both current consumers (the pipeline CLI, the API in local dev) are read
// directly by a human. LOG_FORMAT=json forces JSON regardless of NODE_ENV —
// useful for the pipeline when something else is parsing its output.
function isPrettyOutput(): boolean {
  if (process.env.LOG_FORMAT === 'json') return false;
  if (process.env.NODE_ENV === 'production') return false;
  return true;
}

// Each caller gets its own pino instance (not a shared singleton) so the
// `name` field is baked into every log line without needing `.child()` at
// every call site — e.g. createLogger('api') vs createLogger('pipeline').
export function createLogger(name: string) {
  return pino({
    name,
    level: process.env.LOG_LEVEL ?? 'info',
    transport: isPrettyOutput()
      ? {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
        }
      : undefined,
  });
}
