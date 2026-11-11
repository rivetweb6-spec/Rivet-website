import { productInterests } from '@/lib/data/content';

/**
 * Maps a category lineage (most specific first) to one of the quotation
 * form's product-interest options. Moved unchanged from the product page so
 * category pages can prefill the quotation form the same way.
 *
 * - first lineage name that equals an interest (case-insensitive) wins
 * - otherwise "Other" when a category is known, else undefined
 */
export function matchProductInterest(lineage: (string | null | undefined)[]): string | undefined {
  const names = lineage.filter(Boolean) as string[];
  const matched = names.find((name) =>
    productInterests.some((interest) => interest.toLowerCase() === name.toLowerCase()),
  );
  return (
    productInterests.find((interest) => interest.toLowerCase() === matched?.toLowerCase()) ??
    (names.length > 0 ? 'Other' : undefined)
  );
}
