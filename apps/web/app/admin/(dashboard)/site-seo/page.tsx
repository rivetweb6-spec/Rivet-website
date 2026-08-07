'use client';

import * as React from 'react';
import { adminApi, type PageSeoRecord, type SeoFieldsInput } from '@/lib/admin-api';
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

const PAGE_KEYS = [
  { key: 'home', label: 'Homepage', path: '/' },
  { key: 'products', label: 'Products catalog', path: '/products' },
  { key: 'services', label: 'Services index', path: '/services' },
  { key: 'company', label: 'About / Company', path: '/company' },
  { key: 'news', label: 'News index', path: '/news' },
  { key: 'contact', label: 'Contact', path: '/contact' },
  { key: 'request-quotation', label: 'Request a Quotation', path: '/request-quotation' },
] as const;

const DEFAULTS: Record<string, { title: string; description: string }> = {
  home: {
    title: 'Premium Elevators, Granite & Building Materials in Ethiopia',
    description:
      'RIVET imports premium elevators, granite, doors, sanitary ware and building materials for projects in Ethiopia.',
  },
  products: {
    title: 'Products — Elevators, Granite, Doors & Materials',
    description: 'Browse RIVET’s premium catalog and request a quotation in Ethiopia.',
  },
  services: {
    title: 'Services — Import, Installation & Consultation | Rivet',
    description: 'RIVET services in Ethiopia: import, installation, maintenance, and consultation.',
  },
  company: {
    title: 'About Rivet — River Company in Ethiopia',
    description: 'History, vision, mission and values of River Company (RIVET).',
  },
  news: {
    title: 'News & Insights | Rivet',
    description: 'Journal of RIVET projects, product launches and company updates.',
  },
  contact: {
    title: 'Contact Rivet in Addis Ababa, Ethiopia',
    description: 'Contact River Company (RIVET) — office, phone, email and social channels.',
  },
  'request-quotation': {
    title: 'Request a Quotation | Rivet',
    description:
      'Request a quotation for commercial and residential products from Rivet in Ethiopia.',
  },
};

export default function AdminSiteSeoPage() {
  const [pages, setPages] = React.useState<PageSeoRecord[]>([]);
  const [activeKey, setActiveKey] = React.useState<string>('home');
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
  const defaults = DEFAULTS[activeKey]!;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await adminApi.pageSeo.upsert(activeKey, seoPayload(form));
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
