import type { NewsArticle } from '@/lib/api';

/** Newest published articles first. Missing dates sort last. */
export function sortNewsNewestFirst(articles: NewsArticle[]): NewsArticle[] {
  return [...articles].sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : Number.NEGATIVE_INFINITY;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : Number.NEGATIVE_INFINITY;
    return tb - ta;
  });
}
