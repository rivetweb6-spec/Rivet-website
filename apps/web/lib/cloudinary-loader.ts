/**
 * Custom Next.js image loader.
 * Optimizes Cloudinary and Unsplash URLs; passes through other remotes.
 *
 * Wired via next.config.ts → images.loaderFile
 */

type LoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

/** Insert Cloudinary delivery transforms after `/upload/`. */
function withCloudinaryTransforms(src: string, width: number, quality: number): string {
  const marker = '/upload/';
  const idx = src.indexOf(marker);
  if (idx === -1) return src;

  const before = src.slice(0, idx + marker.length);
  const after = src.slice(idx + marker.length);

  // Strip an existing transform segment (no file extension in that part).
  const rest = after.includes('/') && !after.split('/')[0]!.includes('.')
    ? after.slice(after.indexOf('/') + 1)
    : after;

  const transforms = `f_auto,c_limit,w_${width},q_${quality}`;
  return `${before}${transforms}/${rest}`;
}

/**
 * Next.js requires custom loaders to embed `width` in the returned URL so it
 * can tell the image was actually resized. Hosts we do not transform still get
 * a query hint; they ignore it, and the warning goes away.
 */
function withWidthHint(src: string, width: number): string {
  try {
    const absolute = /^https?:\/\//i.test(src);
    const url = absolute ? new URL(src) : new URL(src, 'http://rivet.local');
    url.searchParams.set('w', String(width));
    return absolute ? url.toString() : `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return src;
  }
}

export default function rivetImageLoader({ src, width, quality }: LoaderProps): string {
  const q = quality ?? 75;

  if (src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  if (src.includes('res.cloudinary.com') && src.includes('/upload/')) {
    return withCloudinaryTransforms(src, width, q);
  }

  if (src.includes('images.unsplash.com')) {
    try {
      const url = new URL(src);
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('w', String(width));
      url.searchParams.set('q', String(q));
      return url.toString();
    } catch {
      return src;
    }
  }

  return withWidthHint(src, width);
}
