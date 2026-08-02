import { describe, it, expect } from 'vitest';
import { MovieRowSchema } from '../src/validators/schemas.js';

describe('MovieRowSchema', () => {
  it('accepts a valid movie row', () => {
    const result = MovieRowSchema.safeParse({
      id: 278,
      title: 'The Shawshank Redemption',
      vote_average: 8.7,
      vote_count: 20000,
    });
    expect(result.success).toBe(true);
  });

  it('rejects a row with no title', () => {
    const result = MovieRowSchema.safeParse({ id: 1, title: '' });
    expect(result.success).toBe(false);
  });

  it('coerces budget of 0 to null', () => {
    const result = MovieRowSchema.safeParse({
      id: 1,
      title: 'Test',
      budget: 0,
      vote_average: 5,
      vote_count: 10,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.budget).toBeNull();
  });

  it('accepts and preserves poster_path when present', () => {
    const result = MovieRowSchema.safeParse({
      id: 278,
      title: 'The Shawshank Redemption',
      poster_path: '/rhIRbceoE9lR4veEXuwCC2wARtG.jpg',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.poster_path).toBe('/rhIRbceoE9lR4veEXuwCC2wARtG.jpg');
  });

  it('leaves poster_path undefined when absent', () => {
    const result = MovieRowSchema.safeParse({ id: 278, title: 'The Shawshank Redemption' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.poster_path).toBeUndefined();
  });
});
