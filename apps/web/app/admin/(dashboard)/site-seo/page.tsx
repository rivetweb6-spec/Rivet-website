'use client';

import * as React from 'react';
import { adminApi, revalidatePublicCache, type PageSeoRecord, type SeoFieldsInput } from '@/lib/admin-api';
import {
  AdminButton,
  AdminCard,
  AdminPageHeader,
  EmptyState,
} from '@/components/admin/ui';
import {
  emptySeoFields,
  pickSeoFields,
  seoPayload,
  SeoFieldsPanel,
} from '@/components/admin/seo-fields-panel';
import { PAGE_SEO_DEFAULTS, PAGE_SEO_KEYS, type PageSeoKey } from '@/lib/page-seo-defaults';

const PAGE_LABELS: Record<PageSeoKey, string> = {
  home: 'Homepage',
  products: 'Products catalog',
  services: 'Services index',
  company: 'About / Company',
  'certificate-portfolio': 'Certificate & Portfolio',
  team: 'Meet Our Team',
  gallery: 'Company Gallery',
  news: 'News index',
  careers: 'Careers',
  contact: 'Contact',
  'request-quotation': 'Request a Quotation',
};

const PAGE_KEYS = PAGE_SEO_KEYS.map((key) => ({
  key,
  label: PAGE_LABELS[key],
  path: PAGE_SEO_DEFAULTS[key].path,
}));

export default function AdminSiteSeoPage() {
  const [pages, setPages] = React.useState<PageSeoRecord[]>([]);
  const [activeKey, setActiveKey] = React.useState<PageSeoKey>('home');
  const [form, setForm] = React.useState<SeoFieldsInput>(emptySeoFields());
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const load = React.useCallback(async () => {
    const { pages: list } = await adminApi.pageSeo.list();
    setPages(list);
  }, []);

  React.useEffect(() => {
    load().catch((e: Error) => setError(e.message));
  }, [load]);

  React.useEffect(() => {
    const existing = pages.find((p) => p.pageKey === activeKey);
    setForm(existing ? pickSeoFields(existing) : emptySeoFields());
    setSaved(false);
  }, [activeKey, pages]);

  const meta = PAGE_KEYS.find((p) => p.key === activeKey)!;
  const defaults = PAGE_SEO_DEFAULTS[activeKey];

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await adminApi.pageSeo.upsert(activeKey, seoPayload(form));
      await revalidatePublicCache('page-seo');
      await load();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Site SEO"
        description="Override titles, descriptions, and social metadata for static public pages."
      />
      {error && <p className="mb-4 text-[0.875rem] text-error">{error}</p>}
      {saved && <p className="mb-4 text-[0.875rem] text-navy">SEO settings saved.</p>}

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <AdminCard className="h-fit p-2">
          <nav className="space-y-1">
            {PAGE_KEYS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setActiveKey(p.key)}
                className={`block w-full rounded-[10px] px-3 py-2.5 text-left text-[0.875rem] transition-colors ${
                  activeKey === p.key
                    ? 'bg-navy text-white'
                    : 'text-ink hover:bg-bg'
                }`}
              >
                {p.label}
              </button>
            ))}
          </nav>
        </AdminCard>

        <AdminCard>
          {!meta ? (
            <EmptyState message="Select a page." />
          ) : (
            <form onSubmit={save}>
              <h2 className="text-[1.25rem] text-navy">{meta.label}</h2>
              <p className="mt-1 text-[0.875rem] text-muted">Public path: {meta.path}</p>
              <SeoFieldsPanel
                value={form}
                onChange={setForm}
                fallbackTitle={defaults.title}
                fallbackDescription={defaults.description}
                pathPreview={meta.path}
                showSlug={false}
              />
              <div className="mt-6 flex justify-end">
                <AdminButton type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save SEO'}
                </AdminButton>
              </div>
            </form>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
