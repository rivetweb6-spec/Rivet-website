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

const LOOPBACK_UPLOAD = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/api\/uploads\/files\/.+)$/i;

/**
 * Uploads made against a local API are stored as `http://localhost:4000/api/
 * uploads/files/…`. Served as-is they only load on the machine running the
 * API — not on a phone testing over Wi-Fi. Rewrite them to the same-origin
 * `/api/uploads/files/…` path, which the Next.js `/api` proxy serves on any
 * host. Production uploads use the real API host and are left untouched.
 */
export function sameOriginUploadUrl(src: string): string {
  const match = LOOPBACK_UPLOAD.exec(src);
  return match ? match[3]! : src;
}

/** Make a media src absolute for Open Graph / crawlers. */
export function toAbsoluteMediaUrl(src: string, siteUrl: string): string {
  if (!src) return src;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/')) return `${siteUrl.replace(/\/$/, '')}${src}`;
  return src;
}
