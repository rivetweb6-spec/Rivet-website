import { z } from 'zod';

/** True for remote http(s) URLs or files stored by this API. */
export function isImageRef(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (v.startsWith('/api/uploads/files/')) return true;
  if (v.includes('/api/uploads/files/')) return true;
  try {
    const url = new URL(v);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Accepts a full URL, a same-origin upload path, or empty/null. */
export const imageRefSchema = z
  .string()
  .max(2048)
  .refine((v) => v === '' || isImageRef(v), {
    message: 'Must be an image URL or an uploaded file path',
  });
