/**
 * Helpers for CMS image URLs — local uploads, Cloudinary, or pasted links.
 */

export function isMediaUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (v.startsWith('/api/uploads/files/') || v.includes('/api/uploads/files/')) return true;
  if (v.includes('res.cloudinary.com') || v.includes('images.unsplash.com')) return true;
  try {
    const url = new URL(v);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    return /\.(png|jpe?g|gif|webp|avif)(\?|$)/i.test(url.pathname);
  } catch {
    return false;
  }
}

/** Make a media src absolute for Open Graph / crawlers. */
export function toAbsoluteMediaUrl(src: string, siteUrl: string): string {
  if (!src) return src;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/')) return `${siteUrl.replace(/\/$/, '')}${src}`;
  return src;
}
