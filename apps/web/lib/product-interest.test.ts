import { describe, expect, it } from 'vitest';
import { matchProductInterest } from './product-interest';

describe('matchProductInterest', () => {
  it('uses the category name when it is an interest', () => {
    expect(matchProductInterest(['granite'])).toBe('Granite');
  });

  it('falls back to an ancestor name', () => {
    expect(matchProductInterest(['Panoramic Elevators', 'Passenger Elevators', 'Elevators'])).toBe(
      'Elevators',
    );
  });

  it('returns Other for an unknown category and undefined without one', () => {
    expect(matchProductInterest(['Lighting'])).toBe('Other');
    expect(matchProductInterest([undefined])).toBeUndefined();
  });
});
