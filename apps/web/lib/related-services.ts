/**
 * Picks services that relate to a product or category by name.
 *
 * There is no explicit service ↔ category link in the data, so we match the
 * significant words of the category lineage (e.g. "Passenger Elevators",
 * "Elevators") against service titles and slugs. When nothing matches we
 * return an empty list so the page hides the section instead of showing
 * unrelated services (e.g. "Elevator Installation" on a sanitary product).
 */

const STOP_WORDS = new Set([
  'and',
  'the',
  'for',
  'goods',
  'products',
  'product',
  'solutions',
  'range',
  'other',
  'systems',
]);

/** Lower-case, singular-ish keyword stems ("Elevators" → "elevator"). */
export function keywordStems(names: (string | null | undefined)[]): string[] {
  const stems = new Set<string>();
  for (const name of names) {
    if (!name) continue;
    for (const raw of name.toLowerCase().split(/[^a-z]+/)) {
      if (raw.length < 4 || STOP_WORDS.has(raw)) continue;
      stems.add(raw.endsWith('s') ? raw.slice(0, -1) : raw);
    }
  }
  return [...stems];
}

export function relatedServices<T extends { title: string; slug: string }>(
  services: T[],
  categoryNames: (string | null | undefined)[],
  limit = 3,
): T[] {
  const stems = keywordStems(categoryNames);
  if (stems.length === 0) return [];
  return services
    .filter((s) => {
      const haystack = `${s.title} ${s.slug}`.toLowerCase();
      return stems.some((stem) => haystack.includes(stem));
    })
    .slice(0, limit);
}
