import fs from 'node:fs/promises';
import { Router } from 'express';
import multer from 'multer';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, badRequest, notFound, param } from '../../utils/http.js';
import { validate } from '../../middleware/validate.js';
import { matchesDeclaredMime } from '../../utils/image-signature.js';
import { detectDocumentKind } from '../../utils/document-signature.js';
import {
  cloudinaryEnabled,
  cloudinaryPublicIdFromUrl,
  cloudinaryRawPublicIdFromUrl,
  destroyCloudinaryImage,
  destroyCloudinaryRaw,
  uploadBuffer,
  uploadRawBuffer,
} from '../../config/cloudinary.js';
import {
  ALLOWED_MIME,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_FILES,
  deleteLocalFile,
  isAllowedPdfFile,
  isLocalUploadUrl,
  localFilenameFromUrl,
  publicApiBase,
  resolvedUploadPath,
  saveLocalFile,
  saveLocalPdf,
} from '../../config/storage.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: MAX_UPLOAD_FILES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Only JPEG, PNG, WebP, GIF, and AVIF images are allowed'));
  },
});

function handleMultipart(req: Request, res: Response, next: NextFunction) {
  upload.array('files', MAX_UPLOAD_FILES)(req, res, (err: unknown) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(badRequest('File is too large. Maximum size is 8 MB.'));
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return next(badRequest('Too many files. Maximum is 10.'));
      }
      return next(badRequest(err.message));
    }
    if (err instanceof Error) return next(badRequest(err.message));
    return next(err);
  });
}

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (isAllowedPdfFile(file.mimetype, file.originalname)) {
      cb(null, true);
      return;
    }
    cb(new Error('Only PDF files are allowed'));
  },
});

function handlePdfMultipart(req: Request, res: Response, next: NextFunction) {
  pdfUpload.single('file')(req, res, (err: unknown) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(badRequest('PDF is too large. Maximum size is 8 MB.'));
      }
      return next(badRequest(err.message));
    }
    if (err instanceof Error) return next(badRequest(err.message));
    return next(err);
  });
}

router.get(
  '/files/:filename',
  asyncHandler(async (req, res) => {
    const filename = param(req, 'filename');
    const filePath = resolvedUploadPath(filename);
    if (!filePath) throw notFound('Image not found');
    try {
      await fs.access(filePath);
    } catch {
      throw notFound('Image not found');
    }
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (filename.toLowerCase().endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
    res.sendFile(filePath, (err) => {
      if (err && !res.headersSent) {
        res.status(404).json({ error: 'Image not found' });
      }
    });
  }),
);

router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  handleMultipart,
  asyncHandler(async (req, res) => {
    const files = (req.files as Express.Multer.File[]) ?? [];
    if (files.length === 0) throw badRequest('No files uploaded');

    // fileFilter only sees the client-declared Content-Type, so confirm the
    // bytes really are the image type they claim to be.
    for (const file of files) {
      if (!matchesDeclaredMime(file.buffer, file.mimetype)) {
        throw badRequest(
          `"${file.originalname}" is not a valid ${file.mimetype} image. Please re-export it and try again.`,
        );
      }
    }

    const base = publicApiBase(req);
    const results = await Promise.all(
      files.map((file) =>
        cloudinaryEnabled ? uploadBuffer(file.buffer) : saveLocalFile(file, base),
      ),
    );
    res.status(201).json({ images: results });
  }),
);

router.post(
  '/document',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  handlePdfMultipart,
  asyncHandler(async (req, res) => {
    const file = req.file;
    if (!file) throw badRequest('No PDF uploaded');
    if (detectDocumentKind(file.buffer) !== 'pdf') {
      throw badRequest(`"${file.originalname}" is not a valid PDF file.`);
    }
    const document = cloudinaryEnabled
      ? await uploadRawBuffer(file.buffer, 'document.pdf', 'rivet/documents')
      : await saveLocalPdf(file, publicApiBase(req));
    res.status(201).json({ document: { ...document, name: file.originalname } });
  }),
);

const deleteSchema = z.object({
  url: z.string().min(1),
});

router.delete(
  '/',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ body: deleteSchema }),
  asyncHandler(async (req, res) => {
    const { url } = req.body as z.infer<typeof deleteSchema>;
    if (isLocalUploadUrl(url)) {
      const filename = localFilenameFromUrl(url);
      if (filename) await deleteLocalFile(filename);
    } else if (cloudinaryRawPublicIdFromUrl(url)) {
      await destroyCloudinaryRaw(cloudinaryRawPublicIdFromUrl(url)!);
    } else {
      const publicId = cloudinaryPublicIdFromUrl(url);
      if (publicId) await destroyCloudinaryImage(publicId);
    }
    res.json({ ok: true });
  }),
);

export default router;
