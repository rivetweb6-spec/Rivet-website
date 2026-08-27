/**
 * Build a URL slug from arbitrary human text.
 *
 * Accented Latin is folded to ASCII ("Café" -> "cafe"), but other scripts are
 * preserved rather than stripped: RIVET publishes Amharic content, and dropping
 * non-Latin characters used to collapse every such title to "-", which then
 * collided with the next one. Non-ASCII slugs are valid in URLs (browsers and
 * crawlers percent-encode them).
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    // strip combining marks left behind by NFKD so "é" becomes "e"
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    // keep letters and digits from any script, plus the separator
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
