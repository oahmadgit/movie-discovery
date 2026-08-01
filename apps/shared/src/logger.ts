import pino from 'pino';

function isPrettyOutput(): boolean {
  if (process.env.LOG_FORMAT === 'json') return false;
  if (process.env.NODE_ENV === 'production') return false;
  return true;
}

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
