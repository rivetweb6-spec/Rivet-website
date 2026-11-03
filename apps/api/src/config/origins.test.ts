import { describe, expect, it } from 'vitest';
import { isAllowedOrigin, parseAllowedOrigins } from './origins.js';

describe('parseAllowedOrigins', () => {
  it('parses a comma-separated list of exact origins', () => {
    expect(
      parseAllowedOrigins(' https://rivet.example.com , http://localhost:3000 '),
    ).toEqual(new Set(['https://rivet.example.com', 'http://localhost:3000']));
  });

  it('normalises a trailing slash and host case', () => {
    expect(parseAllowedOrigins('https://Rivet.Example.com/')).toEqual(
      new Set(['https://rivet.example.com']),
    );
  });

  it('ignores empty entries', () => {
    expect(parseAllowedOrigins('https://a.example.com,,')).toEqual(
      new Set(['https://a.example.com']),
    );
  });

  it.each(['https://*.vercel.app', 'https://rivet-*.vercel.app', '*'])(
    'rejects wildcard entry %s',
    (entry) => {
      expect(() => parseAllowedOrigins(entry)).toThrow(/wildcard/);
    },
  );

  it('rejects entries with a path', () => {
    expect(() => parseAllowedOrigins('https://rivet.example.com/admin')).toThrow(/origin only/);
  });

  it('rejects non-http schemes and garbage', () => {
    expect(() => parseAllowedOrigins('ftp://rivet.example.com')).toThrow(/http/);
    expect(() => parseAllowedOrigins('rivet.example.com')).toThrow(/not a valid URL/);
  });
});

describe('isAllowedOrigin', () => {
  const allowed = parseAllowedOrigins('https://rivet.vercel.app,http://localhost:3000');

  it('accepts exact matches', () => {
    expect(isAllowedOrigin(allowed, 'https://rivet.vercel.app')).toBe(true);
    expect(isAllowedOrigin(allowed, 'http://localhost:3000')).toBe(true);
  });

  it('rejects other sites on the same shared domain', () => {
    expect(isAllowedOrigin(allowed, 'https://evil.vercel.app')).toBe(false);
    expect(isAllowedOrigin(allowed, 'https://rivet-evil.vercel.app')).toBe(false);
  });

  it('rejects look-alikes, other ports and schemes', () => {
    expect(isAllowedOrigin(allowed, 'https://rivet.vercel.app.evil.com')).toBe(false);
    expect(isAllowedOrigin(allowed, 'http://localhost:3001')).toBe(false);
    expect(isAllowedOrigin(allowed, 'http://rivet.vercel.app')).toBe(false);
  });

  it('rejects missing or malformed origins', () => {
    expect(isAllowedOrigin(allowed, undefined)).toBe(false);
    expect(isAllowedOrigin(allowed, 'null')).toBe(false);
  });
});
