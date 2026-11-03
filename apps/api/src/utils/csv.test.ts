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

  it('quotes cells containing a carriage return', () => {
    expect(toCsv([{ note: 'a\rb' }])).toBe('note\n"a\rb"');
  });
});

describe('CSV formula injection', () => {
  it.each([
    ['=HYPERLINK("http://evil.example","Click")', `"'=HYPERLINK(""http://evil.example"",""Click"")"`],
    ['=1+1', "'=1+1"],
    ['+cmd|" /C calc"!A0', `"'+cmd|"" /C calc""!A0"`],
    ['-2+3+cmd|x', "'-2+3+cmd|x"],
    ['@SUM(A1:A2)', "'@SUM(A1:A2)"],
    ['\t=1+1', "'\t=1+1"],
  ])('neutralizes %j', (input, expected) => {
    expect(toCsv([{ v: input }])).toBe(`v\n${expected}`);
  });

  it.each(['+251 911 234 567', '-12.5', '+1 (555) 010-0000', '0911234567'])(
    'leaves numbers and phone numbers unchanged: %s',
    (input) => {
      expect(toCsv([{ v: input }])).toBe(`v\n${input}`);
    },
  );

  it('leaves ordinary text alone', () => {
    expect(toCsv([{ v: 'Need 3 elevators = urgent' }])).toBe('v\nNeed 3 elevators = urgent');
  });
});
