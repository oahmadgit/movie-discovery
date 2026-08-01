import { describe, it, expect } from 'vitest';
import { sanitiseRepr, parseJsonColumn } from '../src/parsers/movies.js';

describe('sanitiseRepr', () => {
  it('converts single quotes to double quotes', () => {
    expect(sanitiseRepr("{'id': 1}")).toBe('{"id": 1}');
  });

  it('converts Python None to null', () => {
    expect(sanitiseRepr("{'budget': None}")).toBe('{"budget": null}');
  });

  it('converts Python True/False to boolean literals', () => {
    expect(sanitiseRepr("{'adult': False}")).toBe('{"adult": false}');
  });
});

describe('parseJsonColumn', () => {
  it('returns empty array for empty input', () => {
    expect(parseJsonColumn('')).toEqual([]);
    expect(parseJsonColumn('[]')).toEqual([]);
  });

  it('returns empty array for malformed input without throwing', () => {
    expect(parseJsonColumn('not json at all')).toEqual([]);
  });

  it('parses a valid stringified genres column', () => {
    const raw = "[{'id': 28, 'name': 'Action'}]";
    expect(parseJsonColumn(raw)).toEqual([{ id: 28, name: 'Action' }]);
  });
});
