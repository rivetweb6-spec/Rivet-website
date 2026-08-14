'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  adminApi,
  revalidatePublicCache,
  type AdminCertificate,
  type CertificateInput,
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

const emptyForm = (order = 1): CertificateInput => ({
  title: '',
  description: '',
  image: '',
  order,
  status: 'PUBLISHED',
});

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = React.useState<AdminCertificate[]>([]);
  const [form, setForm] = React.useState<CertificateInput>(emptyForm());
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const load = () => adminApi.certificates.list().then((r) => setCertificates(r.certificates));

  React.useEffect(() => {
    load().catch((e: Error) => setError(e.message));
  }, []);

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
      const payload: CertificateInput = {
        title: form.title.trim(),
        description: form.description?.trim() || null,
        image: form.image || null,
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
    if (!confirm('Delete this certificate?')) return;
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
    if (nextIndex < 0 || nextIndex >= certificates.length) return;
    const next = [...certificates];
    const item = next[index];
    const swapWith = next[nextIndex];
    if (!item || !swapWith) return;
    next[index] = swapWith;
    next[nextIndex] = item;
    setCertificates(next);
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
        title="Certificates"
        description="Upload, caption, and order the credentials shown on the public company page."
        actions={
          <AdminButton
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm(certificates.length + 1));
              setOpen(true);
            }}
          >
            Add certificate
          </AdminButton>
        }
      />
      {error && <p className="mb-4 text-[0.875rem] text-error">{error}</p>}

      {certificates.length === 0 ? (
        <EmptyState message="No certificates yet. Add a title and upload an image to get started." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {certificates.map((c, index) => (
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
                      disabled={index === certificates.length - 1}
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
            {editingId ? 'Edit certificate' : 'New certificate'}
          </h2>
          <AdminInput
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <AdminTextarea
            label="Short description (optional)"
            rows={3}
            value={form.description ?? ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <ImageUploadField
            label="Certificate image"
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
