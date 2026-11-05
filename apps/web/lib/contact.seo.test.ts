import { describe, expect, it } from 'vitest';
import { isProfileUrl } from './contact';

describe('isProfileUrl', () => {
  it('accepts real profile URLs', () => {
    expect(isProfileUrl('https://www.facebook.com/rivetplc')).toBe(true);
    expect(isProfileUrl('https://t.me/rivet')).toBe(true);
  });

  it('rejects placeholders, bare domains and non-URLs', () => {
    expect(isProfileUrl('https://facebook.com')).toBe(false);
    expect(isProfileUrl('https://linkedin.com/')).toBe(false);
    expect(isProfileUrl('+251000000000')).toBe(false);
    expect(isProfileUrl('')).toBe(false);
    expect(isProfileUrl(null)).toBe(false);
  });
});
