'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  adminApi,
  revalidatePublicCache,
  type AdminCertificate,
  type CertificateInput,
  type CertificateKind,
} from '@/lib/admin-api';
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
import { ImageUploadField } from '@/components/admin/image-upload-field';
import { extraImages } from '@/components/company/image-lightbox';

const TABS: { id: CertificateKind; label: string }[] = [
  { id: 'CERTIFICATE', label: 'Certificates' },
  { id: 'PORTFOLIO', label: 'Portfolio' },
];

const emptyForm = (kind: CertificateKind, order = 1): CertificateInput => ({
  title: '',
  description: '',
  image: '',
  images: [],
  kind,
  order,
  status: 'PUBLISHED',
});

export default function AdminCertificatesPage() {
  const [kind, setKind] = React.useState<CertificateKind>('CERTIFICATE');
  const [certificates, setCertificates] = React.useState<AdminCertificate[]>([]);
  const [form, setForm] = React.useState<CertificateInput>(emptyForm('CERTIFICATE'));
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const load = () => adminApi.certificates.list().then((r) => setCertificates(r.certificates));

  React.useEffect(() => {
    load().catch((e: Error) => setError(e.message));
  }, []);

  const items = certificates.filter((c) => (c.kind ?? 'CERTIFICATE') === kind);
  const isPortfolio = kind === 'PORTFOLIO';
  const noun = isPortfolio ? 'portfolio item' : 'certificate';

  const bustCache = async () => {
    try {
      await revalidatePublicCache('certificates');
    } catch {
      /* public cache will refresh on the next ISR window */
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const extras = extraImages(form.images);
      const payload: CertificateInput = {
        title: form.title.trim(),
        description: form.description?.trim() || null,
        image: form.image || null,
        images: extras,
        kind,
        order: form.order,
        status: form.status,
      };
      if (editingId) await adminApi.certificates.update(editingId, payload);
      else await adminApi.certificates.create(payload);
      await bustCache();
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm(`Delete this ${noun}?`)) return;
    try {
      await adminApi.certificates.remove(id);
      await bustCache();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const next = [...items];
    const item = next[index];
    const swapWith = next[nextIndex];
    if (!item || !swapWith) return;
    next[index] = swapWith;
    next[nextIndex] = item;
    try {
      const { certificates: updated } = await adminApi.certificates.reorder(next.map((c) => c.id));
      setCertificates(updated);
      await bustCache();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reorder failed');
      await load();
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Certificate & Portfolio"
        description="Manage credentials and project work shown on the public Certificate & Portfolio page."
        actions={
          <AdminButton
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm(kind, items.length + 1));
              setOpen(true);
            }}
          >
            Add {noun}
          </AdminButton>
        }
      />

      <div className="mb-6 flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setKind(tab.id)}
            className={`rounded-full px-4 py-2 text-[0.875rem] transition-colors ${
              kind === tab.id ? 'bg-navy text-white' : 'bg-surface text-ink hover:bg-bg'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-[0.875rem] text-error">{error}</p>}

      {items.length === 0 ? (
        <EmptyState
          message={
            isPortfolio
              ? 'No portfolio items yet. Add a project title, description, and images.'
              : 'No certificates yet. Add a title and upload an image to get started.'
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((c, index) => (
            <AdminCard key={c.id} className="flex flex-col">
              <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-[12px] border border-border bg-bg">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image} alt="" className="h-full w-full object-contain p-3" />
                ) : (
                  <div className="grid h-full place-items-center text-[0.8125rem] text-muted">
                    No image
                  </div>
                )}
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-[1.0625rem] text-navy">{c.title}</h3>
                  {c.description && (
                    <p className="mt-1 line-clamp-2 text-[0.875rem] text-muted">{c.description}</p>
                  )}
                  <div className="mt-3">
                    <StatusBadge status={c.status} />
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="grid h-8 w-8 place-items-center rounded-[8px] text-navy hover:bg-bg disabled:opacity-30"
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => void move(index, -1)}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      className="grid h-8 w-8 place-items-center rounded-[8px] text-navy hover:bg-bg disabled:opacity-30"
                      aria-label="Move down"
                      disabled={index === items.length - 1}
                      onClick={() => void move(index, 1)}
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                  <div className="mt-1 text-[0.8125rem]">
                    <button
                      type="button"
                      className="mr-3 text-navy hover:text-gold"
                      onClick={() => {
                        setEditingId(c.id);
                        setForm({
                          title: c.title,
                          description: c.description ?? '',
                          image: c.image ?? '',
                          images: extraImages(c.images),
                          kind: (c.kind as CertificateKind) ?? kind,
                          order: c.order,
                          status: (c.status as 'DRAFT' | 'PUBLISHED') ?? 'PUBLISHED',
                        });
                        setOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button type="button" className="text-error" onClick={() => void remove(c.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      <AdminModal open={open} onClose={() => setOpen(false)} className="max-w-2xl">
        <form onSubmit={(e) => void save(e)} className="space-y-4">
          <h2 className="text-[1.25rem] text-navy">
            {editingId ? `Edit ${noun}` : `New ${noun}`}
          </h2>
          <AdminInput
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <AdminTextarea
            label={isPortfolio ? 'Description' : 'Short description (optional)'}
            rows={isPortfolio ? 5 : 3}
            value={form.description ?? ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <ImageUploadField
            label={isPortfolio ? 'Cover image' : 'Certificate image'}
            value={form.image ?? ''}
            onChange={(image) => setForm({ ...form, image })}
            onError={setError}
          />
          {isPortfolio && (
            <ImageUploadField
              label="Additional portfolio images"
              multiple
              value={(form.images ?? []).join('\n')}
              onChange={(value) =>
                setForm({
                  ...form,
                  images: value
                    .split('\n')
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              onError={setError}
            />
          )}
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
          <div className="flex justify-end gap-3">
            <AdminButton type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
