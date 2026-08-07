import { Prisma } from '@prisma/client';
import { z } from 'zod';

export const faqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export type FaqItem = z.infer<typeof faqItemSchema>;

/** Shared optional SEO override fields for content models. */
export const seoFieldsSchema = z.object({
  seoTitle: z.string().max(120).optional().nullable(),
  seoDescription: z.string().max(320).optional().nullable(),
  primaryKeyword: z.string().max(120).optional().nullable(),
  ogTitle: z.string().max(120).optional().nullable(),
  ogDescription: z.string().max(320).optional().nullable(),
  ogImage: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
  noIndex: z.boolean().optional(),
});

export type SeoFields = z.infer<typeof seoFieldsSchema>;

/** Normalize empty strings to null for optional URL/text SEO fields. */
export function normalizeSeoFields<T extends Partial<SeoFields>>(data: T): T {
  const out = { ...data };
  for (const key of [
    'seoTitle',
    'seoDescription',
    'primaryKeyword',
    'ogTitle',
    'ogDescription',
    'ogImage',
    'canonicalUrl',
  ] as const) {
    if (key in out && (out[key] === '' || out[key] === undefined)) {
      (out as Record<string, unknown>)[key] = null;
    }
  }
  return out;
}

/** Prisma Json? fields reject TS `null`; use DbNull to clear. */
export function toPrismaFaqs(
  faqs: FaqItem[] | null | undefined,
): FaqItem[] | typeof Prisma.DbNull | undefined {
  if (faqs === undefined) return undefined;
  if (faqs === null) return Prisma.DbNull;
  return faqs;
}
