import { Router } from 'express';
import multer from 'multer';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, badRequest } from '../../utils/http.js';
import { cloudinaryEnabled, uploadBuffer } from '../../config/cloudinary.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  upload.array('files', 10),
  asyncHandler(async (req, res) => {
    if (!cloudinaryEnabled) {
      throw badRequest('Cloudinary is not configured. Set CLOUDINARY_* env vars.');
    }
    const files = (req.files as Express.Multer.File[]) ?? [];
    if (files.length === 0) throw badRequest('No files uploaded');

    const results = await Promise.all(files.map((f) => uploadBuffer(f.buffer)));
    res.status(201).json({ images: results });
  }),
);

export default router;
