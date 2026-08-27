import { describe, it, expect } from 'vitest';
import { slugify } from './slug.js';

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('Premium Elevators')).toBe('premium-elevators');
  });

  it('strips punctuation and symbols', () => {
    expect(slugify('RIVET® — Granite & Doors!')).toBe('rivet-granite-doors');
  });

  it('collapses repeated spaces and hyphens', () => {
    expect(slugify('office   furniture --- deluxe')).toBe('office-furniture-deluxe');
  });

  it('trims surrounding whitespace', () => {
    expect(slugify('   Sanitary Ware   ')).toBe('sanitary-ware');
  });

  it('keeps existing numbers', () => {
    expect(slugify('Model 5000 X')).toBe('model-5000-x');
  });

  it('folds accented Latin to ASCII', () => {
    expect(slugify('Ascensore Café Niño')).toBe('ascensore-cafe-nino');
  });

  it('keeps non-Latin scripts instead of collapsing them to a separator', () => {
    expect(slugify('አሳንሰር ሊፍት')).toBe('አሳንሰር-ሊፍት');
    expect(slugify('电梯产品')).toBe('电梯产品');
    expect(slugify('Лифт Оборудование')).toBe('лифт-оборудование');
  });

  it('gives distinct slugs to distinct non-Latin names', () => {
    expect(slugify('አሳንሰር')).not.toBe(slugify('ሊፍት'));
  });

  it('returns empty when there is nothing sluggable', () => {
    expect(slugify('!!! ??? ***')).toBe('');
  });

  it('never leaves a leading or trailing separator', () => {
    expect(slugify('!! Granite !!')).toBe('granite');
  });
});
