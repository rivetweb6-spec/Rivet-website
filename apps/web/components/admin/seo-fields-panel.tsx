'use client';

import * as React from 'react';
import { AdminInput, AdminTextarea } from '@/components/admin/ui';
import { SeoPreview } from '@/components/admin/seo-preview';
import type { SeoFieldsInput, SeoFieldsPayload } from '@/lib/admin-api';

export const emptySeoFields = (): SeoFieldsInput => ({
  slug: '',
  seoTitle: '',
  seoDescription: '',
  primaryKeyword: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  canonicalUrl: '',
  noIndex: false,
});

export function pickSeoFields(entity: {
  slug?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  primaryKeyword?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean | null;
}): SeoFieldsInput {
  return {
    slug: entity.slug ?? '',
    seoTitle: entity.seoTitle ?? '',
    seoDescription: entity.seoDescription ?? '',
    primaryKeyword: entity.primaryKeyword ?? '',
    ogTitle: entity.ogTitle ?? '',
    ogDescription: entity.ogDescription ?? '',
    ogImage: entity.ogImage ?? '',
    canonicalUrl: entity.canonicalUrl ?? '',
    noIndex: entity.noIndex ?? false,
  };
}

export function seoPayload(fields: SeoFieldsInput): SeoFieldsPayload {
  return {
    ...(fields.slug?.trim() ? { slug: fields.slug.trim() } : {}),
    seoTitle: fields.seoTitle?.trim() || null,
    seoDescription: fields.seoDescription?.trim() || null,
    primaryKeyword: fields.primaryKeyword?.trim() || null,
    ogTitle: fields.ogTitle?.trim() || null,
    ogDescription: fields.ogDescription?.trim() || null,
    ogImage: fields.ogImage?.trim() || null,
    canonicalUrl: fields.canonicalUrl?.trim() || null,
    noIndex: fields.noIndex ?? false,
  };
}

export function SeoFieldsPanel({
  value,
  onChange,
  fallbackTitle,
  fallbackDescription,
  fallbackImage,
  pathPreview,
  showSlug = true,
}: {
  value: Parameters<typeof pickSeoFields>[0];
  onChange: (next: SeoFieldsInput) => void;
  fallbackTitle: string;
  fallbackDescription: string;
  fallbackImage?: string;
  pathPreview: string;
  showSlug?: boolean;
}) {
  const fields = pickSeoFields(value);
  const set = <K extends keyof SeoFieldsInput>(key: K, v: SeoFieldsInput[K]) =>
    onChange({ ...fields, [key]: v });

  return (
    <div className="mt-6 space-y-4 rounded-[12px] border border-border bg-bg/50 p-4">
      <div>
        <h3 className="text-[0.9375rem] font-semibold text-navy">SEO & social sharing</h3>
        <p className="mt-1 text-[0.8125rem] text-muted">
          Leave fields blank to auto-generate from page content.
        </p>
      </div>

      {showSlug && (
        <AdminInput
          label="URL slug"
          value={fields.slug ?? ''}
          onChange={(e) => set('slug', e.target.value)}
          placeholder="auto-from-name"
        />
      )}

      <AdminInput
        label="SEO title"
        value={fields.seoTitle ?? ''}
        onChange={(e) => set('seoTitle', e.target.value)}
        placeholder={fallbackTitle}
      />
      <AdminTextarea
        label="Meta description"
        rows={3}
        value={fields.seoDescription ?? ''}
        onChange={(e) => set('seoDescription', e.target.value)}
        placeholder={fallbackDescription}
      />
      <AdminInput
        label="Primary keyword"
        value={fields.primaryKeyword ?? ''}
        onChange={(e) => set('primaryKeyword', e.target.value)}
      />
      <AdminInput
        label="Open Graph title"
        value={fields.ogTitle ?? ''}
        onChange={(e) => set('ogTitle', e.target.value)}
        placeholder={fields.seoTitle || fallbackTitle}
      />
      <AdminTextarea
        label="Open Graph description"
        rows={2}
        value={fields.ogDescription ?? ''}
        onChange={(e) => set('ogDescription', e.target.value)}
        placeholder={fields.seoDescription || fallbackDescription}
      />
      <AdminInput
        label="Social image URL"
        value={fields.ogImage ?? ''}
        onChange={(e) => set('ogImage', e.target.value)}
        placeholder={fallbackImage || 'https://…'}
      />
      <AdminInput
        label="Canonical URL"
        value={fields.canonicalUrl ?? ''}
        onChange={(e) => set('canonicalUrl', e.target.value)}
        placeholder={`Auto: ${pathPreview}`}
      />
      <label className="flex items-center gap-2 text-[0.875rem] text-ink">
        <input
          type="checkbox"
          checked={Boolean(fields.noIndex)}
          onChange={(e) => set('noIndex', e.target.checked)}
        />
        No-index (exclude from search engines)
      </label>

      <SeoPreview
        title={fields.seoTitle || fallbackTitle}
        description={fields.seoDescription || fallbackDescription}
        path={pathPreview}
        ogTitle={fields.ogTitle || fields.seoTitle || fallbackTitle}
        ogDescription={fields.ogDescription || fields.seoDescription || fallbackDescription}
        image={fields.ogImage || fallbackImage}
      />
    </div>
  );
}
