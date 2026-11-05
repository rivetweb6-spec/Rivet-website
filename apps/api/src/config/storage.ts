import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import type { Request } from 'express';
import { env, isProd } from './env.js';
import { cloudinaryEnabled } from './cloudinary.js';
import { badRequest } from '../utils/http.js';
import { DOCUMENT_EXT, DOCUMENT_MIME, type DocumentKind } from '../utils/document-signature.js';

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

/** Public documents (certificate / portfolio PDFs) stored next to images. */
const DOCUMENT_FILE_EXT = new Set(['.pdf']);

/**
 * Quick first filter for document uploads: PDF only. Some browsers send PDFs as
 * application/octet-stream, so a .pdf filename is also accepted — the bytes are
 * verified afterwards either way.
 */
export function isAllowedPdfFile(mime: string, originalName: string): boolean {
  return mime === 'application/pdf' || path.extname(originalName).toLowerCase() === '.pdf';
}

export const MAX_CV_BYTES = 8 * 1024 * 1024;

/**
 * Extensions of CV files that may exist on disk. New uploads are PDF only,
 * but applications received before that rule (Word files) must stay
 * downloadable for HR.
 */
const STORED_CV_EXT = new Set(['.pdf', '.doc', '.docx']);

export function cvsDir(): string {
  return path.join(uploadsDir(), 'cvs');
}

export async function ensureCvsDir(): Promise<void> {
  await fs.mkdir(cvsDir(), { recursive: true });
}

/**
 * Quick first filter for new CV uploads: PDF only. Some browsers send PDFs as
 * application/octet-stream, so a .pdf filename is also accepted here — the
 * file's bytes are verified afterwards either way.
 */
export function isAllowedCvFile(mime: string, originalName: string): boolean {
  return mime === 'application/pdf' || path.extname(originalName).toLowerCase() === '.pdf';
}

export function resolvedCvPath(filename: string): string | null {
  const safe = path.basename(filename);
  if (safe !== filename || safe.includes('..')) return null;
  const root = cvsDir();
  const resolved = path.resolve(root, safe);
  const rel = path.relative(root, resolved);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return resolved;
}

/**
 * Store a CV whose type was verified from its bytes (`kind`). The extension
 * and MIME type come from that check, never from what the uploader declared.
 */
export async function saveLocalCv(
  file: Express.Multer.File,
  kind: DocumentKind,
): Promise<{ publicId: string; mimeType: string }> {
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${DOCUMENT_EXT[kind]}`;
  await ensureCvsDir();
  const dest = resolvedCvPath(filename);
  if (!dest) throw badRequest('Could not store CV');
  await fs.writeFile(dest, file.buffer);
  return { publicId: `local:${filename}`, mimeType: DOCUMENT_MIME[kind] };
}

export async function deleteLocalCv(filename: string): Promise<void> {
  const dest = resolvedCvPath(filename);
  if (!dest) return;
  try {
    await fs.unlink(dest);
  } catch {
    /* already gone */
  }
}

export function localCvFilename(publicId: string): string | null {
  if (!publicId.startsWith('local:')) return null;
  const raw = publicId.slice('local:'.length);
  if (!raw || raw.includes('..') || raw.includes('/') || raw.includes('\\')) return null;
  const filename = path.basename(raw);
  if (!filename || filename !== raw) return null;
  const ext = path.extname(filename).toLowerCase();
  if (!STORED_CV_EXT.has(ext)) return null;
  return filename;
}

export function uploadsDir(): string {
  return path.resolve(env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'));
}

export async function ensureUploadsDir(): Promise<void> {
  await fs.mkdir(uploadsDir(), { recursive: true });
}

/**
 * On hosts with an ephemeral filesystem (Render/Railway/Fly without a mounted
 * disk) anything written to the local uploads directory disappears on the next
 * deploy or restart, leaving the database pointing at URLs that 404 forever.
 * That has already happened in production, so the misconfiguration is reported
 * loudly at boot instead of being discovered later through broken images.
 */
export function warnIfUploadsAreEphemeral(): void {
  if (!isProd) return;
  if (cloudinaryEnabled) return;
  if (env.UPLOAD_DIR) {
    console.warn(
      `[uploads] Cloudinary is not configured; storing images on disk at ${uploadsDir()}. ` +
        'Confirm this path is a mounted persistent volume, or uploads will be lost on redeploy.',
    );
    return;
  }
  console.error(
    [
      '',
      '='.repeat(78),
      ' UPLOADS ARE NOT PERSISTENT — IMAGES WILL BE LOST ON THE NEXT DEPLOY',
      '='.repeat(78),
      ' CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET are unset',
      ` and UPLOAD_DIR is unset, so uploads go to ${uploadsDir()} on an ephemeral disk.`,
      '',
      ' Every image an admin uploads will 404 after the next restart or redeploy.',
      ' Fix by either:',
      '   1. setting the three CLOUDINARY_* env vars (recommended), or',
      '   2. mounting a persistent disk and pointing UPLOAD_DIR at it.',
      '='.repeat(78),
      '',
    ].join('\n'),
  );
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
  if (!ALLOWED_EXT.has(ext) && !DOCUMENT_FILE_EXT.has(ext)) return null;
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

/** Store a PDF whose bytes were already verified; served from /api/uploads/files/. */
export async function saveLocalPdf(
  file: Express.Multer.File,
  publicBase: string,
): Promise<{ url: string; publicId: string }> {
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.pdf`;
  await ensureUploadsDir();
  const dest = resolvedUploadPath(filename);
  if (!dest) throw badRequest('Could not store document');
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
