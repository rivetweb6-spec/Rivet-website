import { describe, it, expect } from 'vitest';
import { isImageRef } from './image-ref.js';
import { cloudinaryPublicIdFromUrl } from '../config/cloudinary.js';
import {
  extensionFor,
  localFilenameFromUrl,
  resolvedUploadPath,
} from '../config/storage.js';

describe('isImageRef', () => {
  it('accepts http(s) URLs', () => {
    expect(isImageRef('https://cdn.example.com/a.jpg')).toBe(true);
    expect(isImageRef('http://localhost:4000/api/uploads/files/a.jpg')).toBe(true);
  });

  it('accepts local upload paths', () => {
    expect(isImageRef('/api/uploads/files/123-ab.jpg')).toBe(true);
  });

  it('rejects empty or junk', () => {
    expect(isImageRef('')).toBe(false);
    expect(isImageRef('not a url')).toBe(false);
  });
});

describe('extensionFor', () => {
  it('maps mime types', () => {
    expect(extensionFor('image/jpeg', 'x.bin')).toBe('.jpg');
    expect(extensionFor('image/png', 'x.bin')).toBe('.png');
  });

  it('falls back to filename extension', () => {
    expect(extensionFor('application/octet-stream', 'shot.WEBP')).toBe('.webp');
  });

  it('rejects unknown types', () => {
    expect(extensionFor('application/pdf', 'doc.pdf')).toBeNull();
  });
});

describe('localFilenameFromUrl', () => {
  it('extracts a safe basename', () => {
    expect(
      localFilenameFromUrl('http://localhost:4000/api/uploads/files/123-ab.jpg'),
    ).toBe('123-ab.jpg');
  });

  it('rejects path traversal', () => {
    expect(localFilenameFromUrl('/api/uploads/files/../secret.jpg')).toBeNull();
    expect(localFilenameFromUrl('/api/uploads/files/foo/bar.jpg')).toBeNull();
  });
});

describe('resolvedUploadPath', () => {
  it('rejects traversal filenames', () => {
    expect(resolvedUploadPath('../secret.jpg')).toBeNull();
    expect(resolvedUploadPath('foo/bar.jpg')).toBeNull();
  });

  it('resolves a simple filename inside the uploads dir', () => {
    const dest = resolvedUploadPath('abc.jpg');
    expect(dest).toBeTruthy();
    expect(dest!.replace(/\\/g, '/')).toMatch(/uploads\/abc\.jpg$/);
  });
});

describe('cloudinaryPublicIdFromUrl', () => {
  it('extracts folder and id', () => {
    expect(
      cloudinaryPublicIdFromUrl(
        'https://res.cloudinary.com/demo/image/upload/v1234567/rivet/abc.jpg',
      ),
    ).toBe('rivet/abc');
  });

  it('ignores non-cloudinary URLs', () => {
    expect(cloudinaryPublicIdFromUrl('http://localhost:4000/api/uploads/files/a.jpg')).toBeNull();
  });
});
