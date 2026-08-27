import { describe, it, expect } from 'vitest';
import { detectImageKind, matchesDeclaredMime } from './image-signature.js';

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
const gif = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00]);
const webp = Buffer.concat([
  Buffer.from('RIFF', 'latin1'),
  Buffer.from([0x1a, 0x00, 0x00, 0x00]),
  Buffer.from('WEBPVP8 ', 'latin1'),
]);
const avif = Buffer.concat([
  Buffer.from([0x00, 0x00, 0x00, 0x20]),
  Buffer.from('ftypavif', 'latin1'),
]);

describe('detectImageKind', () => {
  it('recognises each supported format', () => {
    expect(detectImageKind(jpeg)).toBe('jpeg');
    expect(detectImageKind(png)).toBe('png');
    expect(detectImageKind(gif)).toBe('gif');
    expect(detectImageKind(webp)).toBe('webp');
    expect(detectImageKind(avif)).toBe('avif');
  });

  it('returns null for non-image content', () => {
    expect(detectImageKind(Buffer.from('<?php echo 1; ?>', 'utf8'))).toBeNull();
    expect(detectImageKind(Buffer.from('<svg xmlns="..."></svg>', 'utf8'))).toBeNull();
    expect(detectImageKind(Buffer.from('%PDF-1.7', 'utf8'))).toBeNull();
    expect(detectImageKind(Buffer.alloc(0))).toBeNull();
    expect(detectImageKind(Buffer.from([0xff, 0xd8]))).toBeNull();
  });
});

describe('matchesDeclaredMime', () => {
  it('accepts bytes that match the declared type', () => {
    expect(matchesDeclaredMime(png, 'image/png')).toBe(true);
    expect(matchesDeclaredMime(jpeg, 'image/jpeg')).toBe(true);
    expect(matchesDeclaredMime(webp, 'image/webp')).toBe(true);
  });

  it('rejects a real image mislabelled as another type', () => {
    expect(matchesDeclaredMime(png, 'image/jpeg')).toBe(false);
    expect(matchesDeclaredMime(gif, 'image/png')).toBe(false);
  });

  it('rejects non-image bytes claiming to be an image', () => {
    expect(matchesDeclaredMime(Buffer.from('<?php system($_GET[0]); ?>', 'utf8'), 'image/png')).toBe(
      false,
    );
    expect(matchesDeclaredMime(Buffer.from('<script>alert(1)</script>', 'utf8'), 'image/gif')).toBe(
      false,
    );
  });

  it('rejects an unsupported declared type even with valid image bytes', () => {
    expect(matchesDeclaredMime(png, 'image/svg+xml')).toBe(false);
    expect(matchesDeclaredMime(png, 'application/pdf')).toBe(false);
  });
});
