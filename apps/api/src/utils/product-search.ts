/**
 * Flexible product search: partial words, singular/plural variations,
 * typo tolerance (edit distance), any word order, case-insensitive,
 * extra whitespace, and relevance ranking across name, category, brand,
 * descriptions, features and country of origin.
 */

/** Split a search query into lowercase tokens for flexible matching. */
export function tokenizeSearch(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

/** Reduce a word to a crude singular stem so "chairs" matches "chair" and "categories" matches "category". */
export function stemToken(token: string): string {
  if (token.length > 4 && token.endsWith('ies')) return token.slice(0, -3);
  if (token.length > 3 && token.endsWith('es')) return token.slice(0, -2);
  if (token.length > 2 && token.endsWith('s')) return token.slice(0, -1);
  return token;
}

/**
 * Bounded Damerau-Levenshtein (optimal string alignment) distance.
 * Returns Infinity as soon as the distance exceeds `max`.
 */
export function editDistance(a: string, b: string, max: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return Infinity;

  let prevPrev: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);

  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(
        prev[j]! + 1, // deletion
        current[j - 1]! + 1, // insertion
        prev[j - 1]! + cost, // substitution
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, prevPrev[j - 2]! + 1); // transposition
      }
      current.push(value);
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > max) return Infinity;
    prevPrev = prev;
    prev = current;
  }

  return prev[b.length]! <= max ? prev[b.length]! : Infinity;
}

/** Max typo distance allowed for a query token of a given length. */
function typoBudget(length: number): number {
  if (length >= 7) return 2;
  if (length >= 4) return 1;
  return 0;
}

export type SearchableProduct = {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  brand?: string | null;
  countryOfOrigin?: string | null;
  features?: unknown;
  category?: { name: string; slug: string } | null;
};

type IndexedProduct = {
  id: string;
  name: string;
  nameWords: string[];
  primary: string; // name + brand + category — the high-signal text
  primaryWords: string[];
  full: string; // everything searchable
  fullWords: string[];
};

function words(text: string): string[] {
  return text.split(/[^a-z0-9]+/).filter((w) => w.length > 0);
}

function indexProduct(p: SearchableProduct): IndexedProduct {
  const features = Array.isArray(p.features) ? (p.features as unknown[]).join(' ') : '';
  const primary = [p.name, p.brand, p.category?.name, p.category?.slug, p.slug]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const full = [primary, p.shortDescription, p.description, p.countryOfOrigin, features]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const name = p.name.toLowerCase();
  return {
    id: p.id,
    name,
    nameWords: words(name),
    primary,
    primaryWords: words(primary),
    full,
    fullWords: words(full),
  };
}

/** Score one token against one product; 0 means the token does not match. */
function scoreToken(token: string, product: IndexedProduct): number {
  const stem = stemToken(token);

  // Exact / partial substring matches (also covers plural text for singular queries).
  if (product.name.includes(token)) return product.name.startsWith(token) ? 50 : 40;
  if (product.primary.includes(token)) return 30;
  if (product.full.includes(token)) return 18;

  // Singular-stem substring matches ("chairs" -> "chair", "categories" -> "categor…").
  if (stem !== token) {
    if (product.name.includes(stem)) return 34;
    if (product.primary.includes(stem)) return 26;
    if (product.full.includes(stem)) return 14;
  }

  // Typo-tolerant word match ("ofice" -> "office", "chiar" -> "chair").
  const budget = typoBudget(token.length);
  if (budget === 0) return 0;

  const fuzzyHit = (candidates: string[]): boolean =>
    candidates.some(
      (word) =>
        editDistance(token, word, budget) <= budget ||
        (stem !== token && editDistance(stem, stemToken(word), budget) <= budget) ||
        // Typo inside a prefix of a longer word ("elevatr" -> "elevators").
        (word.length > token.length + 1 &&
          editDistance(token, word.slice(0, token.length), budget) <= budget),
    );

  if (fuzzyHit(product.nameWords)) return 22;
  if (fuzzyHit(product.primaryWords)) return 12;
  if (fuzzyHit(product.fullWords)) return 6;

  return 0;
}

export type RankedResult = { id: string; score: number };

/**
 * Rank products against a query. Every token must match at least one field
 * (any word order); results are sorted by cumulative relevance.
 */
export function rankProducts(products: SearchableProduct[], query: string): RankedResult[] {
  const tokens = tokenizeSearch(query);
  if (tokens.length === 0) return products.map((p) => ({ id: p.id, score: 0 }));

  const results: RankedResult[] = [];
  for (const product of products) {
    const indexed = indexProduct(product);
    let total = 0;
    let matchedAll = true;
    for (const token of tokens) {
      const score = scoreToken(token, indexed);
      if (score === 0) {
        matchedAll = false;
        break;
      }
      total += score;
    }
    if (matchedAll) results.push({ id: product.id, score: total });
  }

  return results.sort((a, b) => b.score - a.score);
}

/** Rank plain named entities (e.g. categories) against a query. */
export function rankByName<T extends { name: string; slug: string }>(
  items: T[],
  query: string,
): T[] {
  const tokens = tokenizeSearch(query);
  if (tokens.length === 0) return [];

  return items
    .map((item) => {
      const text = `${item.name} ${item.slug}`.toLowerCase();
      const textWords = words(text);
      let score = 0;
      for (const token of tokens) {
        const stem = stemToken(token);
        const budget = typoBudget(token.length);
        if (text.includes(token)) score += 20;
        else if (stem !== token && text.includes(stem)) score += 14;
        else if (
          budget > 0 &&
          textWords.some((w) => editDistance(stem, stemToken(w), budget) <= budget)
        )
          score += 8;
      }
      return { item, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.item);
}
