import { describe, it, expect } from 'vitest';
import { toCsv } from './csv.js';

describe('toCsv', () => {
  it('returns an empty string for no rows and no columns', () => {
    expect(toCsv([])).toBe('');
  });

  it('returns only the header when columns are given but rows are empty', () => {
    expect(toCsv([], ['name', 'email'])).toBe('name,email');
  });

  it('serializes rows using inferred columns', () => {
    const csv = toCsv([
      { name: 'Alice', email: 'a@rivet.com' },
      { name: 'Bob', email: 'b@rivet.com' },
    ]);
    expect(csv).toBe('name,email\nAlice,a@rivet.com\nBob,b@rivet.com');
  });

  it('respects an explicit column order and subset', () => {
    const csv = toCsv([{ name: 'Alice', email: 'a@rivet.com', phone: '123' }], ['email', 'name']);
    expect(csv).toBe('email,name\na@rivet.com,Alice');
  });

  it('escapes commas, quotes and newlines', () => {
    const csv = toCsv([{ note: 'Hello, "world"\nsecond line' }]);
    expect(csv).toBe('note\n"Hello, ""world""\nsecond line"');
  });

  it('renders null and undefined as empty cells', () => {
    const csv = toCsv([{ a: null, b: undefined, c: 0 }]);
    expect(csv).toBe('a,b,c\n,,0');
  });
});
