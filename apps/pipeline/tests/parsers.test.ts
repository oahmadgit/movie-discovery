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

  it('preserves apostrophes inside a double-quoted repr value', () => {
    // Python's repr() switches a string's own delimiter to " when the value
    // contains a ' — e.g. character names like "Ellis Boyd 'Red' Redding".
    // A blind '-to-" replace would mangle the inner quotes; this must not.
    const raw = `{'character': "Ellis Boyd 'Red' Redding"}`;
    expect(JSON.parse(sanitiseRepr(raw))).toEqual({ character: "Ellis Boyd 'Red' Redding" });
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
