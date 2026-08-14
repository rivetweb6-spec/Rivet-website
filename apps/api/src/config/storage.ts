import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import type { Request } from 'express';
import { env } from './env.js';
import { badRequest } from '../utils/http.js';

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const MAX_UPLOAD_FILES = 10;

export const ALLOWED_MIME = new Map<string, string>([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
  ['image/avif', '.avif'],
]);

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

export function uploadsDir(): string {
  return path.resolve(env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'));
}

export async function ensureUploadsDir(): Promise<void> {
  await fs.mkdir(uploadsDir(), { recursive: true });
}

export function extensionFor(mime: string, originalName: string): string | null {
  const fromMime = ALLOWED_MIME.get(mime);
  if (fromMime) return fromMime;
  const ext = path.extname(originalName).toLowerCase();
  if (ALLOWED_EXT.has(ext)) return ext === '.jpeg' ? '.jpg' : ext;
  return null;
}

/** Public origin of this API (no trailing slash, no `/api` suffix). */
export function publicApiBase(req: Request): string {
  if (env.PUBLIC_API_URL) {
    return env.PUBLIC_API_URL.replace(/\/$/, '').replace(/\/api$/, '');
  }
  const proto = String(req.get('x-forwarded-proto') ?? req.protocol)
    .split(',')[0]
    ?.trim();
  const host = String(req.get('x-forwarded-host') ?? req.get('host') ?? 'localhost')
    .split(',')[0]
    ?.trim();
  return `${proto || 'http'}://${host}`;
}

export function isLocalUploadUrl(url: string): boolean {
  return url.includes('/api/uploads/files/');
}

/** Basename of a local upload, or null if the URL is not ours / unsafe. */
export function localFilenameFromUrl(url: string): string | null {
  const marker = '/api/uploads/files/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const raw = decodeURIComponent(url.slice(idx + marker.length).split('?')[0] ?? '');
  if (!raw || raw.includes('..') || raw.includes('/') || raw.includes('\\')) return null;
  const filename = path.basename(raw);
  if (!filename || filename !== raw) return null;
  const ext = path.extname(filename).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) return null;
  return filename;
}

export function resolvedUploadPath(filename: string): string | null {
  const safe = path.basename(filename);
  if (safe !== filename || safe.includes('..')) return null;
  const root = uploadsDir();
  const resolved = path.resolve(root, safe);
  const rel = path.relative(root, resolved);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return resolved;
}

export async function saveLocalFile(
  file: Express.Multer.File,
  publicBase: string,
): Promise<{ url: string; publicId: string }> {
  const ext = extensionFor(file.mimetype, file.originalname);
  if (!ext) throw badRequest('Unsupported image type. Use JPEG, PNG, WebP, GIF, or AVIF.');
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
  await ensureUploadsDir();
  const dest = resolvedUploadPath(filename);
  if (!dest) throw badRequest('Could not store image');
  await fs.writeFile(dest, file.buffer);
  const base = publicBase.replace(/\/$/, '').replace(/\/api$/, '');
  const url = `${base}/api/uploads/files/${filename}`;
  return { url, publicId: `local:${filename}` };
}

export async function deleteLocalFile(filename: string): Promise<void> {
  const dest = resolvedUploadPath(filename);
  if (!dest) return;
  try {
    await fs.unlink(dest);
  } catch {
    /* already gone */
  }
}
