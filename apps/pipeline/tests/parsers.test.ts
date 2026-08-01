import { describe, it, expect } from 'vitest';
import JSON5 from 'json5';
import { normalizeLooseJson, parseJsonColumn } from '../src/parsers/movies.js';

describe('normalizeLooseJson', () => {
  it('leaves single-quoted values parseable by JSON5', () => {
    expect(JSON5.parse(normalizeLooseJson("{'id': 1}"))).toEqual({ id: 1 });
  });

  it('converts the None literal to null', () => {
    expect(JSON5.parse(normalizeLooseJson("{'budget': None}"))).toEqual({ budget: null });
  });

  it('converts True/False literals to boolean literals', () => {
    expect(JSON5.parse(normalizeLooseJson("{'adult': False}"))).toEqual({ adult: false });
  });

  it('preserves apostrophes inside a double-quoted value', () => {
    const raw = `{'character': "Ellis Boyd 'Red' Redding"}`;
    expect(JSON5.parse(normalizeLooseJson(raw))).toEqual({ character: "Ellis Boyd 'Red' Redding" });
  });

  it('does not mistake None/True/False appearing inside a string for keywords', () => {
    const raw = `{'title': 'None the Wiser, True to Life'}`;
    expect(JSON5.parse(normalizeLooseJson(raw))).toEqual({ title: 'None the Wiser, True to Life' });
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
