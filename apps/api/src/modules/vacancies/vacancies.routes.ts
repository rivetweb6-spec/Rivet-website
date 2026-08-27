import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import type { NextFunction, Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, badRequest, notFound, param } from '../../utils/http.js';
import { slugify } from '../../utils/slug.js';
import { parseDeadline } from '../../utils/deadline.js';
import { assertSlugAvailable } from '../../utils/slug-conflict.js';
import { normalizeSeoFields, seoFieldsSchema } from '../../utils/seo-fields.js';
import { toCsv } from '../../utils/csv.js';
import { emitEvent } from '../../realtime/stream.js';
import {
  cloudinaryEnabled,
  cloudinaryRawUrl,
  destroyCloudinaryRaw,
  uploadRawBuffer,
} from '../../config/cloudinary.js';
import {
  MAX_CV_BYTES,
  deleteLocalCv,
  isAllowedCvFile,
  localCvFilename,
  resolvedCvPath,
  saveLocalCv,
} from '../../config/storage.js';

const router = Router();

export const VACANCY_STATUSES = ['DRAFT', 'OPEN', 'CLOSED'] as const;
export const APPLICATION_STATUSES = [
  'NEW',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFERED',
  'REJECTED',
  'HIRED',
] as const;

const optionalString = z
  .union([z.string(), z.literal('')])
  .optional()
  .transform((v) => (v ? v : undefined));

const upsertSchema = z
  .object({
    title: z.string().min(1),
    slug: z.string().optional(),
    department: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    employmentType: z.string().optional().nullable(),
    description: z.string().min(1),
    requirements: z.string().min(1),
    deadline: z.string().min(1),
    status: z.enum(VACANCY_STATUSES).optional(),
  })
  .merge(seoFieldsSchema);

const applyFieldsSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  coverLetter: optionalString,
});

const applyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many applications. Please try again later.' },
});

const cvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_CV_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (isAllowedCvFile(file.mimetype, file.originalname)) {
      cb(null, true);
      return;
    }
    cb(new Error('Please upload a PDF or Word document (PDF, DOC, DOCX).'));
  },
});

function handleCvUpload(req: Request, res: Response, next: NextFunction) {
  cvUpload.single('cv')(req, res, (err: unknown) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(badRequest('CV is too large. Maximum size is 8 MB.'));
      }
      return next(badRequest(err.message));
    }
    if (err instanceof Error) return next(badRequest(err.message));
    return next(err);
  });
}

function publicVacancyWhere(): Prisma.VacancyWhereInput {
  return { status: 'OPEN', deadline: { gte: new Date() } };
}

function isAcceptingApplications(vacancy: { status: string; deadline: Date }): boolean {
  return vacancy.status === 'OPEN' && vacancy.deadline.getTime() >= Date.now();
}

function serializeApplication<T extends { cvPublicId: string }>(app: T) {
  const { cvPublicId, ...rest } = app;
  return { ...rest, hasCv: Boolean(cvPublicId) };
}

async function storeCv(file: Express.Multer.File): Promise<{
  cvPublicId: string;
  cvMimeType: string;
}> {
  if (cloudinaryEnabled) {
    const uploaded = await uploadRawBuffer(file.buffer, file.originalname);
    return {
      cvPublicId: uploaded.publicId,
      cvMimeType: file.mimetype || 'application/octet-stream',
    };
  }
  const stored = await saveLocalCv(file);
  return { cvPublicId: stored.publicId, cvMimeType: stored.mimeType };
}

async function removeCv(publicId: string): Promise<void> {
  const local = localCvFilename(publicId);
  if (local) {
    await deleteLocalCv(local);
    return;
  }
  await destroyCloudinaryRaw(publicId);
}

function contentDisposition(originalName: string): string {
  const ascii = originalName.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '');
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(originalName)}`;
}

function vacancyIncludeCount() {
  return { _count: { select: { applications: true } } } as const;
}

// Public — open vacancies that are still accepting applications
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const vacancies = await prisma.vacancy.findMany({
      where: publicVacancyWhere(),
      orderBy: [{ deadline: 'asc' }, { createdAt: 'desc' }],
    });
    res.json({ vacancies });
  }),
);

// Admin — all vacancies
router.get(
  '/admin/all',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  asyncHandler(async (_req, res) => {
    const vacancies = await prisma.vacancy.findMany({
      orderBy: [{ status: 'asc' }, { deadline: 'asc' }],
      include: vacancyIncludeCount(),
    });
    res.json({ vacancies });
  }),
);

// Admin — applications list (before /:slug)
router.get(
  '/applications',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({
    query: z.object({
      vacancyId: z.string().optional(),
      status: z.enum(APPLICATION_STATUSES).optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const where: Prisma.JobApplicationWhereInput = {};
    if (req.query.vacancyId) where.vacancyId = String(req.query.vacancyId);
    if (req.query.status) where.status = req.query.status as (typeof APPLICATION_STATUSES)[number];

    const [applications, counts, unread] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { vacancy: { select: { id: true, title: true, slug: true } } },
      }),
      prisma.jobApplication.groupBy({ by: ['status'], _count: true }),
      prisma.jobApplication.count({ where: { readAt: null } }),
    ]);

    res.json({
      applications: applications.map(serializeApplication),
      counts,
      unread,
    });
  }),
);

router.get(
  '/applications/export',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  asyncHandler(async (_req, res) => {
    const applications = await prisma.jobApplication.findMany({
      orderBy: { createdAt: 'desc' },
      include: { vacancy: { select: { title: true } } },
    });
    const csv = toCsv(
      applications.map((a) => ({
        FullName: a.fullName,
        Email: a.email,
        Phone: a.phone,
        Vacancy: a.vacancy.title,
        CoverLetter: a.coverLetter ?? '',
        CvFilename: a.cvOriginalName,
        Status: a.status,
        Date: a.createdAt.toISOString(),
        AdminNotes: a.adminNotes ?? '',
      })),
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="job-applications.csv"');
    res.send(csv);
  }),
);

router.patch(
  '/applications/read-all',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  asyncHandler(async (_req, res) => {
    const result = await prisma.jobApplication.updateMany({
      where: { readAt: null },
      data: { readAt: new Date() },
    });
    if (result.count > 0) {
      emitEvent({ type: 'job-application-read', data: { unread: 0 } });
    }
    res.json({ unread: 0 });
  }),
);

router.get(
  '/applications/:id/cv',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  asyncHandler(async (req, res) => {
    const application = await prisma.jobApplication.findUnique({
      where: { id: param(req, 'id') },
    });
    if (!application) throw notFound('Application not found');

    res.setHeader('Content-Disposition', contentDisposition(application.cvOriginalName));
    res.setHeader('Cache-Control', 'private, no-store');

    const localName = localCvFilename(application.cvPublicId);
    if (localName) {
      const filePath = resolvedCvPath(localName);
      if (!filePath) throw notFound('CV file not found');
      try {
        await fs.promises.access(filePath);
      } catch {
        throw notFound('CV file not found');
      }
      res.setHeader('Content-Type', application.cvMimeType || 'application/octet-stream');
      res.sendFile(path.resolve(filePath), (err) => {
        if (err && !res.headersSent) {
          res.status(404).json({ error: 'CV file not found' });
        }
      });
      return;
    }

    const remote = await fetch(cloudinaryRawUrl(application.cvPublicId));
    if (!remote.ok) throw notFound('CV file not found');
    const buffer = Buffer.from(await remote.arrayBuffer());
    res.setHeader(
      'Content-Type',
      remote.headers.get('content-type') || application.cvMimeType || 'application/octet-stream',
    );
    res.send(buffer);
  }),
);

router.patch(
  '/applications/:id/read',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  asyncHandler(async (req, res) => {
    const id = param(req, 'id');
    const existing = await prisma.jobApplication.findUnique({
      where: { id },
      include: { vacancy: { select: { id: true, title: true, slug: true } } },
    });
    if (!existing) throw notFound('Application not found');

    const application = existing.readAt
      ? existing
      : await prisma.jobApplication.update({
          where: { id },
          data: { readAt: new Date() },
          include: { vacancy: { select: { id: true, title: true, slug: true } } },
        });

    const unread = await prisma.jobApplication.count({ where: { readAt: null } });
    if (!existing.readAt) {
      emitEvent({ type: 'job-application-read', data: { id: application.id, unread } });
    }
    res.json({ application: serializeApplication(application), unread });
  }),
);

router.patch(
  '/applications/:id',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({
    body: z.object({
      status: z.enum(APPLICATION_STATUSES).optional(),
      adminNotes: z.string().optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const application = await prisma.jobApplication.update({
      where: { id: param(req, 'id') },
      data: req.body,
      include: { vacancy: { select: { id: true, title: true, slug: true } } },
    });
    res.json({ application: serializeApplication(application) });
  }),
);

router.post(
  '/:slug/apply',
  applyLimiter,
  handleCvUpload,
  asyncHandler(async (req, res) => {
    const parsed = applyFieldsSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Validation failed', parsed.error.flatten());

    const vacancy = await prisma.vacancy.findUnique({
      where: { slug: param(req, 'slug') },
    });
    if (!vacancy || !isAcceptingApplications(vacancy)) {
      throw badRequest('This vacancy is no longer accepting applications.');
    }

    const file = req.file;
    if (!file) throw badRequest('Please attach your CV (PDF, DOC, or DOCX).');

    const stored = await storeCv(file);
    const application = await prisma.jobApplication.create({
      data: {
        vacancyId: vacancy.id,
        fullName: parsed.data.fullName.trim(),
        email: parsed.data.email.trim(),
        phone: parsed.data.phone.trim(),
        coverLetter: parsed.data.coverLetter?.trim() || null,
        cvPublicId: stored.cvPublicId,
        cvOriginalName: file.originalname.slice(0, 180),
        cvMimeType: stored.cvMimeType,
      },
    });

    emitEvent({
      type: 'job-application',
      data: { id: application.id, fullName: application.fullName, vacancyTitle: vacancy.title },
    });

    res.status(201).json({ ok: true, id: application.id });
  }),
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const vacancy = await prisma.vacancy.findUnique({
      where: { slug: param(req, 'slug') },
    });
    if (!vacancy || vacancy.status === 'DRAFT') throw notFound('Vacancy not found');
    res.json({
      vacancy: {
        ...vacancy,
        acceptingApplications: isAcceptingApplications(vacancy),
      },
    });
  }),
);

router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ body: upsertSchema }),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof upsertSchema>;
    const {
      seoTitle,
      seoDescription,
      primaryKeyword,
      ogTitle,
      ogDescription,
      ogImage,
      canonicalUrl,
      noIndex,
      deadline,
      department,
      location,
      employmentType,
      ...data
    } = body;
    const slug = await assertSlugAvailable('vacancy', data.slug ?? slugify(data.title));
    const seo = normalizeSeoFields({
      seoTitle,
      seoDescription,
      primaryKeyword,
      ogTitle,
      ogDescription,
      ogImage,
      canonicalUrl,
      noIndex,
    });

    const vacancy = await prisma.vacancy.create({
      data: {
        ...data,
        slug,
        department: department || null,
        location: location || null,
        employmentType: employmentType || null,
        deadline: parseDeadline(deadline),
        ...seo,
      },
      include: vacancyIncludeCount(),
    });
    res.status(201).json({ vacancy });
  }),
);

router.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  validate({ body: upsertSchema.partial() }),
  asyncHandler(async (req, res) => {
    const id = param(req, 'id');
    const body = req.body as Partial<z.infer<typeof upsertSchema>>;
    const existing = await prisma.vacancy.findUnique({ where: { id } });
    if (!existing) throw notFound('Vacancy not found');

    const {
      seoTitle,
      seoDescription,
      primaryKeyword,
      ogTitle,
      ogDescription,
      ogImage,
      canonicalUrl,
      noIndex,
      deadline,
      department,
      location,
      employmentType,
      ...data
    } = body;

    let slug = data.slug;
    if (slug !== undefined || data.title) {
      slug = await assertSlugAvailable('vacancy', slug ?? data.title ?? existing.slug, id);
    }

    const seo = normalizeSeoFields({
      seoTitle,
      seoDescription,
      primaryKeyword,
      ogTitle,
      ogDescription,
      ogImage,
      canonicalUrl,
      noIndex,
    });

    const vacancy = await prisma.vacancy.update({
      where: { id },
      data: {
        ...data,
        ...(slug !== undefined ? { slug } : {}),
        ...(department !== undefined ? { department: department || null } : {}),
        ...(location !== undefined ? { location: location || null } : {}),
        ...(employmentType !== undefined ? { employmentType: employmentType || null } : {}),
        ...(deadline !== undefined ? { deadline: parseDeadline(deadline) } : {}),
        ...seo,
      },
      include: vacancyIncludeCount(),
    });
    res.json({ vacancy });
  }),
);

router.patch(
  '/:id/close',
  requireAuth,
  requireRole('ADMIN', 'EDITOR'),
  asyncHandler(async (req, res) => {
    const id = param(req, 'id');
    const existing = await prisma.vacancy.findUnique({ where: { id } });
    if (!existing) throw notFound('Vacancy not found');
    const vacancy = await prisma.vacancy.update({
      where: { id },
      data: { status: 'CLOSED' },
      include: vacancyIncludeCount(),
    });
    res.json({ vacancy });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const id = param(req, 'id');
    const existing = await prisma.vacancy.findUnique({
      where: { id },
      include: { applications: { select: { cvPublicId: true } } },
    });
    if (!existing) throw notFound('Vacancy not found');

    await Promise.all(existing.applications.map((a) => removeCv(a.cvPublicId)));
    await prisma.vacancy.delete({ where: { id } });
    res.json({ ok: true });
  }),
);

export default router;
