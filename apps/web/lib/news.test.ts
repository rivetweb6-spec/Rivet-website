import { describe, expect, it } from 'vitest';
import type { NewsArticle } from './api';
import { sortNewsNewestFirst } from './news';

function article(partial: Pick<NewsArticle, 'id' | 'publishedAt'>): NewsArticle {
  return {
    title: partial.id,
    slug: partial.id,
    excerpt: null,
    body: '',
    coverImage: null,
    category: null,
    ...partial,
  };
}

describe('sortNewsNewestFirst', () => {
  it('orders by publishedAt descending', () => {
    const sorted = sortNewsNewestFirst([
      article({ id: 'old', publishedAt: '2026-01-01T00:00:00.000Z' }),
      article({ id: 'new', publishedAt: '2026-08-14T00:00:00.000Z' }),
      article({ id: 'mid', publishedAt: '2026-04-01T00:00:00.000Z' }),
    ]);
    expect(sorted.map((a) => a.id)).toEqual(['new', 'mid', 'old']);
  });

  it('places articles without a publication date last', () => {
    const sorted = sortNewsNewestFirst([
      article({ id: 'undated', publishedAt: null }),
      article({ id: 'dated', publishedAt: '2026-08-01T00:00:00.000Z' }),
    ]);
    expect(sorted.map((a) => a.id)).toEqual(['dated', 'undated']);
  });
});
