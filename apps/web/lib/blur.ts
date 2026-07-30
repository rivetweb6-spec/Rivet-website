/**
 * Blur / LQIP helpers for next/image placeholder="blur".
 *
 * Cloudinary deliveries get a tiny blurred transform URL used as progressive
 * preview; everything else falls back to a navy-tinted shimmer data URI.
 */

/** Shared shimmer — navy-tinted, tiny SVG (works as blurDataURL). */
export const DEFAULT_BLUR_DATA_URL =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="10" viewBox="0 0 16 10">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="#002F54" stop-opacity="0.12"/>
          <stop offset="0.5" stop-color="#D69A2E" stop-opacity="0.08"/>
          <stop offset="1" stop-color="#002F54" stop-opacity="0.14"/>
        </linearGradient>
      </defs>
      <rect width="16" height="10" fill="url(#g)"/>
    </svg>`,
  );

/** Build a Cloudinary LQIP URL (very small + blurred). Not a data URI — use with CSS blur-up if needed. */
export function cloudinaryLqipUrl(src: string): string | null {
  if (!src.includes('res.cloudinary.com') || !src.includes('/upload/')) return null;

  const marker = '/upload/';
  const idx = src.indexOf(marker);
  if (idx === -1) return null;

  const before = src.slice(0, idx + marker.length);
  const after = src.slice(idx + marker.length);
  const rest = after.includes('/') && !after.split('/')[0]!.includes('.')
    ? after.slice(after.indexOf('/') + 1)
    : after;

  return `${before}f_auto,c_fill,w_24,h_16,e_blur:1000,q_1/${rest}`;
}

/**
 * Resolve blurDataURL for an image src.
 * Prefers a stable shimmer (valid data URI). Cloudinary LQIP is available via
 * cloudinaryLqipUrl for progressive CSS patterns.
 */
export function resolveBlurDataURL(_src?: string | null): string {
  return DEFAULT_BLUR_DATA_URL;
}
