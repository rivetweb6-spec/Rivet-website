import { describe, it, expect } from 'vitest';
import { BRAND, auditContrast, contrastRatio, passesAA } from './contrast';

describe('contrastRatio', () => {
  it('returns 1 for identical colors', () => {
    expect(contrastRatio(BRAND.navy, BRAND.navy)).toBeCloseTo(1, 5);
  });

  it('returns 21 for black on white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
  });

  it('is symmetric regardless of argument order', () => {
    const a = contrastRatio(BRAND.navy, BRAND.white);
    const b = contrastRatio(BRAND.white, BRAND.navy);
    expect(a).toBeCloseTo(b, 5);
  });

  it('supports 3-digit shorthand hex', () => {
    expect(contrastRatio('#fff', '#000')).toBeCloseTo(21, 1);
  });
});

describe('passesAA', () => {
  it('white on navy meets AA for normal text', () => {
    expect(passesAA(BRAND.white, BRAND.navy, 'normal')).toBe(true);
  });

  it('gold on white fails AA for normal text', () => {
    expect(passesAA(BRAND.gold, BRAND.white, 'normal')).toBe(false);
  });

  it('applies the relaxed 3:1 threshold for large/ui text', () => {
    expect(passesAA(BRAND.gold, BRAND.navy, 'large')).toBe(true);
  });
});

describe('auditContrast', () => {
  it('passes every approved brand pair', () => {
    const results = auditContrast();
    const approved = results.filter((r) => !r.name.includes('NOT'));
    expect(approved.length).toBeGreaterThan(0);
    for (const r of approved) {
      expect(r.pass, `${r.name} (${r.ratio}:1)`).toBe(true);
    }
  });

  it('flags the documented gold-on-white anti-pattern as failing', () => {
    const goldOnWhite = auditContrast().find((r) => r.name.includes('NOT'));
    expect(goldOnWhite?.pass).toBe(false);
  });
});
