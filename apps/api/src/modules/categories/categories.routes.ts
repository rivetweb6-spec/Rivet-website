import type { Prisma } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, badRequest, conflict, notFound, param } from '../../utils/http.js';
import { slugify } from '../../utils/slug.js';
import { assertSlugAvailable } from '../../utils/slug-conflict.js';
import {
  faqItemSchema,
  normalizeSeoFields,
  seoFieldsSchema,
  toPrismaFaqs,
} from '../../utils/seo-fields.js';
import { imageRefSchema } from '../../utils/image-ref.js';

const router = Router();

const upsertSchema = z
  .object({
    name: z.string().min(1),
    slug: z.string().optional(),
    parentId: z.string().nullable().optional().or(z.literal('')),
    description: z.string().optional().nullable(),
    image: imageRefSchema.optional().nullable().or(z.literal('')),
    order: z.number().int().optional(),
    faqs: z.array(faqItemSchema).optional().nullable(),
  })
  .merge(seoFieldsSchema);

async function assertNoCircularParent(categoryId: string, candidateParentId: string): Promise<void> {
  if (categoryId === candidateParentId) {
    throw badRequest('A category cannot be its own parent.');
  }
  let currentId: string | null = candidateParentId;
  const visited = new Set<string>([categoryId]);
  while (currentId) {
    if (visited.has(currentId)) {
      throw badRequest('Circular parent category relationship is not allowed.');
    }
    visited.add(currentId);
    const parentCat: { parentId: string | null } | null = await prisma.category.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });
    if (!parentCat) {
      throw badRequest('Parent category not found.');
    }
    currentId = parentCat.parentId;
  }
}

function readReassignToCategoryId(req: { query: unknown; body: unknown }): string | undefined {
  const fromQuery = (req.query as { reassignToCategoryId?: unknown }).reassignToCategoryId;
  const fromBody = (req.body as { reassignToCategoryId?: unknown } | undefined)?.reassignToCategoryId;
  const raw = typeof fromQuery === 'string' ? fromQuery : typeof fromBody === 'string' ? fromBody : '';
  const id = raw.trim();
  return id || undefined;
}

const categoryInclude: Prisma.CategoryInclude = {
  parent: {
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      parent: { select: { id: true, name: true, slug: true } },
    },
  },
  children: {
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    include: {
      parent: { select: { id: true, name: true, slug: true, parentId: true } },
      children: {
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
        include: {
          parent: { select: { id: true, name: true, slug: true, parentId: true } },
          _count: { select: { products: true, children: true } },
        },
      },
      _count: { select: { products: true, children: true } },
    },
  },
  _count: { select: { products: true, children: true } },
};

// Public
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: categoryInclude,
    });
    res.json({ categories });
  }),
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const category = await prisma.category.findUnique({
      where: { slug: param(req, 'slug') },
      include: categoryInclude,
    });
    if (!category) throw notFound('Category not found');

    if (category.parentId) {
      const allCategories = await prisma.category.findMany({
        select: { id: true, name: true, slug: true, parentId: true },
      });
      const catMap = new Map(allCategories.map((c) => [c.id, c]));

      type ParentRef = {
        id: string;
        name: string;
        slug: string;
        parentId?: string | null;
        parent?: ParentRef | null;
      };

      const buildAncestors = (pId: string | null | undefined): ParentRef | null => {
        if (!pId) return null;
        const p = catMap.get(pId);
        if (!p) return null;
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          parentId: p.parentId,
          parent: buildAncestors(p.parentId),
        };
      };

      (category as Record<string, unknown>).parent = buildAncestors(category.parentId);
    }

    res.json({ category });
  }),
);

// Admin
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
      faqs,
      image,
      parentId: rawParentId,
      ...data
    } = body;

    const parentId = rawParentId && rawParentId.trim() ? rawParentId.trim() : null;
    if (parentId) {
      const parent = await prisma.category.findUnique({ where: { id: parentId } });
      if (!parent) throw badRequest('Parent category not found.');
    }

    const slug = await assertSlugAvailable('category', data.slug ?? slugify(data.name));
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

    const category = await prisma.category.create({
      data: {
        ...data,
        parentId,
        slug,
        image: image || null,
        faqs: toPrismaFaqs(faqs),
        ...seo,
      },
      include: categoryInclude,
    });
    res.status(201).json({ category });
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
    const {
      seoTitle,
      seoDescription,
      primaryKeyword,
      ogTitle,
      ogDescription,
      ogImage,
      canonicalUrl,
      noIndex,
      faqs,
      image,
      parentId: rawParentId,
      ...data
    } = body;

    let parentId: string | null | undefined = undefined;
    if (rawParentId !== undefined) {
      const trimmed = typeof rawParentId === 'string' ? rawParentId.trim() : null;
      parentId = trimmed || null;
      if (parentId) {
        await assertNoCircularParent(id, parentId);
      }
    }

    let slug = data.slug;
    if (slug !== undefined || data.name) {
      const existing = await prisma.category.findUnique({ where: { id } });
      if (!existing) throw notFound('Category not found');
      slug = await assertSlugAvailable(
        'category',
        slug ?? data.name ?? existing.slug,
        id,
      );
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

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...data,
        ...(parentId !== undefined ? { parentId } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(image !== undefined ? { image: image || null } : {}),
        ...(faqs !== undefined ? { faqs: toPrismaFaqs(faqs) } : {}),
        ...seo,
      },
      include: categoryInclude,
    });
    res.json({ category });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const id = param(req, 'id');
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true, children: true } },
        children: { select: { id: true, name: true } },
      },
    });
    if (!category) throw notFound('Category not found');

    const childrenCount = category._count.children;
    if (childrenCount > 0) {
      const names = category.children.map((c) => c.name).join(', ');
      throw conflict(
        `This category has ${childrenCount} subcategor${childrenCount === 1 ? 'y' : 'ies'} (${names}). Please delete or reassign its subcategories before deleting this category.`,
        { childrenCount },
      );
    }

    const productCount = category._count.products;
    const reassignToCategoryId = readReassignToCategoryId(req);

    if (productCount > 0) {
      if (!reassignToCategoryId) {
        throw conflict(
          `This category has ${productCount} product${productCount === 1 ? '' : 's'}. Reassign ${productCount === 1 ? 'it' : 'them'} to another category before deleting.`,
          { productCount },
        );
      }
      if (reassignToCategoryId === id) {
        throw badRequest('Choose a different category to reassign products to.');
      }
      const target = await prisma.category.findUnique({
        where: { id: reassignToCategoryId },
        select: { id: true },
      });
      if (!target) throw badRequest('Target category not found.');

      await prisma.$transaction([
        prisma.product.updateMany({
          where: { categoryId: id },
          data: { categoryId: reassignToCategoryId },
        }),
        prisma.category.delete({ where: { id } }),
      ]);
    } else {
      await prisma.category.delete({ where: { id } });
    }

    res.json({ ok: true });
  }),
);

export default router;
