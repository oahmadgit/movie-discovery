import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createLogger } from '../src/logger.js';

describe('createLogger', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.LOG_LEVEL;
    delete process.env.LOG_FORMAT;
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns a working logger defaulting to info level', () => {
    const logger = createLogger('test-service');
    expect(logger.level).toBe('info');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('respects LOG_LEVEL', () => {
    process.env.LOG_LEVEL = 'debug';
    expect(createLogger('test-service').level).toBe('debug');
  });

  it('does not throw when constructed with LOG_FORMAT=json (no pretty transport)', () => {
    process.env.LOG_FORMAT = 'json';
    expect(() => createLogger('test-service')).not.toThrow();
  });

  it('does not throw when constructed with NODE_ENV=production (no pretty transport)', () => {
    process.env.NODE_ENV = 'production';
    expect(() => createLogger('test-service')).not.toThrow();
  });

  it('does not throw when constructed with pretty output enabled (dev default)', () => {
    expect(() => createLogger('test-service')).not.toThrow();
  });
});
