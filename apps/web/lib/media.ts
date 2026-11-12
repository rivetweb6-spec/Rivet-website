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

/**
 * Hosts that only resolve on the machine or network where an upload was made:
 * loopback, 0.0.0.0, link-local, and the RFC 1918 private ranges
 * (10/8, 172.16/12, 192.168/16).
 */
const PRIVATE_HOST =
  '(?:localhost|0\\.0\\.0\\.0|\\[::1\\]|127(?:\\.\\d{1,3}){3}|10(?:\\.\\d{1,3}){3}|192\\.168(?:\\.\\d{1,3}){2}|172\\.(?:1[6-9]|2\\d|3[01])(?:\\.\\d{1,3}){2}|169\\.254(?:\\.\\d{1,3}){2})';
const PRIVATE_HOST_UPLOAD = new RegExp(
  `^https?://${PRIVATE_HOST}(?::\\d+)?(/api/uploads/files/.+)$`,
  'i',
);

/**
 * The API stores uploads as absolute URLs built from the host the admin used
 * (`http://localhost:4000/…` locally, `http://192.168.x.x:3000/…` when the
 * dashboard was opened over Wi-Fi) unless PUBLIC_API_URL is set. Those hosts
 * never load for visitors, so rewrite such uploads to the same-origin
 * `/api/uploads/files/…` path, which the Next.js `/api` proxy serves on any
 * host. Uploads on a public host (production API, Cloudinary) are untouched.
 */
export function sameOriginUploadUrl(src: string): string {
  const match = PRIVATE_HOST_UPLOAD.exec(src.trim());
  return match ? match[1]! : src;
}

/**
 * Make a media src absolute for Open Graph, JSON-LD and sitemaps. Uploads
 * stored with a private host are first mapped to this site's public origin.
 */
export function toAbsoluteMediaUrl(src: string, siteUrl: string): string {
  if (!src) return src;
  const value = sameOriginUploadUrl(src);
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return `${siteUrl.replace(/\/$/, '')}${value}`;
  return value;
}
