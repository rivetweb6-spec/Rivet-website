/**
 * Verify that an upload really is the image type it claims to be.
 *
 * Multer only sees the client-supplied Content-Type, so a caller can label any
 * bytes as `image/png` and have them stored and served back from our origin.
 * Checking the container signature keeps non-images out of the uploads
 * directory regardless of what the request declares.
 */
export type ImageKind = 'jpeg' | 'png' | 'webp' | 'gif' | 'avif';

const startsWith = (buf: Buffer, bytes: number[], offset = 0): boolean =>
  buf.length >= offset + bytes.length && bytes.every((b, i) => buf[offset + i] === b);

/** Detected container type, or null when the bytes match no supported format. */
export function detectImageKind(buf: Buffer): ImageKind | null {
  if (startsWith(buf, [0xff, 0xd8, 0xff])) return 'jpeg';
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
  if (startsWith(buf, [0x47, 0x49, 0x46, 0x38])) return 'gif';
  // RIFF....WEBP
  if (startsWith(buf, [0x52, 0x49, 0x46, 0x46]) && startsWith(buf, [0x57, 0x45, 0x42, 0x50], 8)) {
    return 'webp';
  }
  // ISO-BMFF: ....ftyp<brand>; AVIF brands are avif/avis/av01
  if (startsWith(buf, [0x66, 0x74, 0x79, 0x70], 4)) {
    const brand = buf.subarray(8, 12).toString('latin1');
    if (brand === 'avif' || brand === 'avis' || brand === 'av01') return 'avif';
  }
  return null;
}

const MIME_TO_KIND = new Map<string, ImageKind>([
  ['image/jpeg', 'jpeg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
  ['image/avif', 'avif'],
]);

/**
 * True when the bytes are a supported image and match the declared MIME type.
 * An unknown or mismatched declaration is rejected rather than corrected, so a
 * caller cannot use the extension we derive from the MIME type to control the
 * stored filename independently of the content.
 */
export function matchesDeclaredMime(buf: Buffer, mime: string): boolean {
  const detected = detectImageKind(buf);
  if (!detected) return false;
  return MIME_TO_KIND.get(mime) === detected;
}
