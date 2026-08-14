'use client';

import * as React from 'react';
import { adminApi, type AdminService, type ServiceInput } from '@/lib/admin-api';
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminModal,
  AdminPageHeader,
  AdminSelect,
  AdminTextarea,
  EmptyState,
  StatusBadge,
} from '@/components/admin/ui';

import {
  emptySeoFields,
  pickSeoFields,
  seoPayload,
  SeoFieldsPanel,
} from '@/components/admin/seo-fields-panel';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import type { FaqItem } from '@/lib/admin-api';

function faqsToText(faqs?: FaqItem[] | null) {
  if (!faqs?.length) return '';
  return faqs.map((f) => `${f.question}\n${f.answer}`).join('\n\n');
}

function textToFaqs(text: string): FaqItem[] {
  return text
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.trim().split('\n');
      const question = lines[0]?.trim() ?? '';
      const answer = lines.slice(1).join('\n').trim();
      return { question, answer };
    })
    .filter((f) => f.question && f.answer);
}

type ServiceForm = ServiceInput & { faqsText: string };

export default function AdminServicesPage() {
  const [services, setServices] = React.useState<AdminService[]>([]);
  const [form, setForm] = React.useState<ServiceForm>({
    title: '',
    narrative: '',
    icon: 'Wrench',
    image: '',
    order: 0,
    status: 'PUBLISHED',
    faqsText: '',
    ...emptySeoFields(),
  });
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = () => adminApi.services.list().then((r) => setServices(r.services));

  React.useEffect(() => {
    load().catch((e: Error) => setError(e.message));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const faqs = textToFaqs(form.faqsText);
      const payload: ServiceInput = {
        title: form.title,
        narrative: form.narrative,
        icon: form.icon,
        image: form.image || null,
        order: form.order,
        status: form.status,
        faqs: faqs.length ? faqs : null,
        ...seoPayload(pickSeoFields(form)),
      };
      if (editingId) await adminApi.services.update(editingId, payload);
      else await adminApi.services.create(payload);
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    await adminApi.services.remove(id);
    await load();
  };

  return (
    <div>
      <AdminPageHeader
        title="Services"
        description="Import, installation, maintenance and consultation offerings."
        actions={
          <AdminButton
            onClick={() => {
              setEditingId(null);
              setForm({
                title: '',
                narrative: '',
                icon: 'Wrench',
                image: '',
                order: services.length + 1,
                status: 'PUBLISHED',
                faqsText: '',
                ...emptySeoFields(),
              });
              setOpen(true);
            }}
          >
            Add service
          </AdminButton>
        }
      />
      {error && <p className="mb-4 text-[0.875rem] text-error">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {services.length === 0 && <EmptyState message="No services yet." />}
        {services.map((s) => (
          <AdminCard key={s.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[1.0625rem] text-navy">{s.title}</h3>
                <p className="mt-2 text-[0.875rem] text-muted line-clamp-3">{s.narrative}</p>
                <div className="mt-3">
                  <StatusBadge status={s.status} />
                </div>
              </div>
              <div className="shrink-0 text-[0.8125rem]">
                <button
                  type="button"
                  className="mr-3 text-navy hover:text-gold"
                  onClick={() => {
                    setEditingId(s.id);
                    setForm({
                      title: s.title,
                      narrative: s.narrative,
                      icon: s.icon ?? 'Wrench',
                      image: s.image ?? '',
                      order: s.order,
                      status: (s.status as 'DRAFT' | 'PUBLISHED') ?? 'PUBLISHED',
                      faqsText: faqsToText(s.faqs),
                      ...pickSeoFields(s),
                    });
                    setOpen(true);
                  }}
                >
                  Edit
                </button>
                <button type="button" className="text-error" onClick={() => remove(s.id)}>
                  Delete
                </button>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} className="max-w-2xl">
        <form onSubmit={save} className="space-y-4">
          <h2 className="text-[1.25rem] text-navy">
            {editingId ? 'Edit service' : 'New service'}
          </h2>
          <AdminInput
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <AdminTextarea
            label="Narrative"
            required
            rows={4}
            value={form.narrative}
            onChange={(e) => setForm({ ...form, narrative: e.target.value })}
          />
          <AdminInput
            label="Lucide icon name"
            value={form.icon ?? ''}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
          />
          <ImageUploadField
            label="Service image"
            value={form.image ?? ''}
            onChange={(image) => setForm({ ...form, image })}
            onError={setError}
          />
          <div className="grid grid-cols-2 gap-4">
            <AdminInput
              label="Order"
              type="number"
              value={form.order ?? 0}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
            />
            <AdminSelect
              label="Status"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as 'DRAFT' | 'PUBLISHED' })
              }
            >
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </AdminSelect>
          </div>
          <AdminTextarea
            label="FAQs (question on first line, answer below; blank line between items)"
            rows={5}
            value={form.faqsText}
            onChange={(e) => setForm({ ...form, faqsText: e.target.value })}
          />
          <SeoFieldsPanel
            value={form}
            onChange={(seo) => setForm({ ...form, ...seo })}
            fallbackTitle={`${form.title || 'Service'} in Ethiopia | Rivet`}
            fallbackDescription={
              (form.narrative ?? '').slice(0, 160) || 'Rivet services in Ethiopia.'
            }
            fallbackImage={form.image ?? undefined}
            pathPreview={`/services/${form.slug || 'service-slug'}`}
          />
          <div className="flex justify-end gap-3">
            <AdminButton type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit">Save</AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
