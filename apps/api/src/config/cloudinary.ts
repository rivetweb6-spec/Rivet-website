import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

export const cloudinaryEnabled = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export { cloudinary };

export function uploadBuffer(
  buffer: Buffer,
  folder = 'rivet',
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

/** `https://res.cloudinary.com/{cloud}/image/upload/v123/rivet/id.jpg` → `rivet/id` */
export function cloudinaryPublicIdFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith('cloudinary.com')) return null;
    const marker = '/upload/';
    const idx = parsed.pathname.indexOf(marker);
    if (idx === -1) return null;
    let rest = parsed.pathname.slice(idx + marker.length);
    rest = rest.replace(/^v\d+\//, '');
    rest = rest.replace(/\.[a-z0-9]+$/i, '');
    return rest || null;
  } catch {
    return null;
  }
}

export async function destroyCloudinaryImage(publicId: string): Promise<void> {
  if (!cloudinaryEnabled || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    /* already gone or remote error — deletion is best-effort */
  }
}

export function uploadRawBuffer(
  buffer: Buffer,
  originalName: string,
  folder = 'rivet/cvs',
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'raw',
        filename_override: originalName,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

export async function destroyCloudinaryRaw(publicId: string): Promise<void> {
  if (!cloudinaryEnabled || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  } catch {
    /* already gone or remote error — deletion is best-effort */
  }
}

export function cloudinaryRawUrl(publicId: string): string {
  return cloudinary.url(publicId, { resource_type: 'raw', secure: true });
}
