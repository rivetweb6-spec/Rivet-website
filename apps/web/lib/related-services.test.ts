import { describe, expect, it } from 'vitest';
import { keywordStems, relatedServices } from './related-services';

const services = [
  { title: 'Product Import', slug: 'product-import' },
  { title: 'Elevator Installation', slug: 'elevator-installation' },
  { title: 'Elevator Maintenance', slug: 'elevator-maintenance' },
  { title: 'Granite Supply', slug: 'granite-supply' },
  { title: 'Building Material Supply', slug: 'building-material-supply' },
];

describe('keywordStems', () => {
  it('drops short and generic words and singularises', () => {
    expect(keywordStems(['Sanitary Goods', 'Passenger Elevators'])).toEqual([
      'sanitary',
      'passenger',
      'elevator',
    ]);
  });
});

describe('relatedServices', () => {
  it('matches elevator services for an elevator subcategory', () => {
    expect(relatedServices(services, ['Passenger Elevators', 'Elevators']).map((s) => s.slug)).toEqual([
      'elevator-installation',
      'elevator-maintenance',
    ]);
  });

  it('matches granite and building materials', () => {
    expect(relatedServices(services, ['Granite']).map((s) => s.slug)).toEqual(['granite-supply']);
    expect(relatedServices(services, ['Building Materials']).map((s) => s.slug)).toEqual([
      'building-material-supply',
    ]);
  });

  it('returns nothing rather than unrelated services', () => {
    expect(relatedServices(services, ['Sanitary Goods'])).toEqual([]);
    expect(relatedServices(services, [undefined, null])).toEqual([]);
  });

  it('respects the limit', () => {
    expect(relatedServices(services, ['Elevators'], 1)).toHaveLength(1);
  });
});
