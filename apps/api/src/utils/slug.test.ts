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
});
