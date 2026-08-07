import { describe, it, expect } from 'vitest';
import {
  tokenizeSearch,
  stemToken,
  editDistance,
  rankProducts,
  rankByName,
  type SearchableProduct,
} from './product-search.js';

describe('tokenizeSearch', () => {
  it('splits on whitespace and lowercases', () => {
    expect(tokenizeSearch('  Granite  Door  ')).toEqual(['granite', 'door']);
  });

  it('returns empty array for blank input', () => {
    expect(tokenizeSearch('   ')).toEqual([]);
  });
});

describe('stemToken', () => {
  it('strips plural endings', () => {
    expect(stemToken('chairs')).toBe('chair');
    expect(stemToken('doors')).toBe('door');
    expect(stemToken('categories')).toBe('categor');
  });

  it('keeps short words intact', () => {
    expect(stemToken('as')).toBe('as');
  });
});

describe('editDistance', () => {
  it('handles substitutions, insertions and transpositions', () => {
    expect(editDistance('ofice', 'office', 2)).toBe(1);
    expect(editDistance('chiar', 'chair', 2)).toBe(1);
    expect(editDistance('granite', 'granite', 2)).toBe(0);
  });

  it('returns Infinity beyond the budget', () => {
    expect(editDistance('door', 'granite', 2)).toBe(Infinity);
  });
});

const products: SearchableProduct[] = [
  {
    id: 'chair-1',
    name: 'Luxury Office Chair',
    slug: 'luxury-office-chair',
    shortDescription: 'Ergonomic executive seating',
    brand: 'Herman',
    category: { name: 'Office Furniture', slug: 'office-furniture' },
  },
  {
    id: 'granite-1',
    name: 'Obsidian Granite Slab',
    slug: 'obsidian-granite-slab',
    shortDescription: 'Full-bleed veined granite from Italy',
    countryOfOrigin: 'Italy',
    category: { name: 'Granite', slug: 'granite' },
  },
  {
    id: 'elevator-1',
    name: 'Meridian Passenger Elevator',
    slug: 'meridian-passenger-elevator',
    features: ['Machine-room-less', 'Brushed steel cabin'],
    category: { name: 'Elevators', slug: 'elevators' },
  },
];

describe('rankProducts', () => {
  const ids = (query: string) => rankProducts(products, query).map((r) => r.id);

  it('matches exact and partial words', () => {
    expect(ids('office chair')).toEqual(['chair-1']);
    expect(ids('chair')).toEqual(['chair-1']);
    expect(ids('luxury')).toEqual(['chair-1']);
  });

  it('is case-insensitive and ignores extra spaces', () => {
    expect(ids('  LUXURY   Chair ')).toEqual(['chair-1']);
  });

  it('matches regardless of word order', () => {
    expect(ids('chair luxury office')).toEqual(['chair-1']);
  });

  it('matches plural queries against singular names', () => {
    expect(ids('chairs')).toEqual(['chair-1']);
    expect(ids('office chairs')).toEqual(['chair-1']);
  });

  it('tolerates typos', () => {
    expect(ids('ofice chair')).toEqual(['chair-1']);
    expect(ids('granit')).toContain('granite-1');
    expect(ids('elevatr')).toContain('elevator-1');
  });

  it('matches category, brand, origin and features', () => {
    expect(ids('furniture')).toEqual(['chair-1']);
    expect(ids('herman')).toEqual(['chair-1']);
    expect(ids('italy')).toEqual(['granite-1']);
    expect(ids('brushed steel')).toEqual(['elevator-1']);
  });

  it('requires all tokens to match (AND semantics)', () => {
    expect(ids('granite chair')).toEqual([]);
  });

  it('ranks name matches above description matches', () => {
    const ranked = rankProducts(products, 'granite');
    expect(ranked[0]?.id).toBe('granite-1');
  });
});

describe('rankByName', () => {
  const categories = [
    { name: 'Office Furniture', slug: 'office-furniture' },
    { name: 'Granite', slug: 'granite' },
    { name: 'Elevators', slug: 'elevators' },
  ];

  it('matches partial and misspelled category names', () => {
    expect(rankByName(categories, 'offic')[0]?.slug).toBe('office-furniture');
    expect(rankByName(categories, 'granit')[0]?.slug).toBe('granite');
    expect(rankByName(categories, 'elevaters')[0]?.slug).toBe('elevators');
  });

  it('returns nothing for unrelated queries', () => {
    expect(rankByName(categories, 'zzzz')).toEqual([]);
  });
});
