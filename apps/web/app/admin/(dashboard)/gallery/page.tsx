'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  adminApi,
  revalidatePublicCache,
  type AdminGalleryImage,
  type GalleryCategory,
  type GalleryImageInput,
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

const CATEGORIES: { id: GalleryCategory; label: string }[] = [
  { id: 'PHOTOS', label: 'Company photos' },
  { id: 'ACTIVITIES', label: 'Activities' },
  { id: 'PROJECTS', label: 'Projects' },
  { id: 'EVENTS', label: 'Events' },
  { id: 'OTHER', label: 'Other' },
];

const emptyForm = (order = 1): GalleryImageInput => ({
  title: '',
  description: '',
  image: '',
  category: 'PHOTOS',
  order,
  status: 'PUBLISHED',
});

export default function AdminGalleryPage() {
  const [images, setImages] = React.useState<AdminGalleryImage[]>([]);
  const [form, setForm] = React.useState<GalleryImageInput>(emptyForm());
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const load = () => adminApi.gallery.list().then((r) => setImages(r.images));

  React.useEffect(() => {
    load().catch((e: Error) => setError(e.message));
  }, []);

  const bustCache = async () => {
    try {
      await revalidatePublicCache('gallery');
    } catch {
      /* public cache will refresh on the next ISR window */
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (!form.image.trim()) {
        setError('Please add an image.');
        setSaving(false);
        return;
      }
      const payload: GalleryImageInput = {
        title: form.title.trim(),
        description: form.description?.trim() || null,
        image: form.image,
        category: form.category,
        order: form.order,
        status: form.status,
      };
      if (editingId) await adminApi.gallery.update(editingId, payload);
      else await adminApi.gallery.create(payload);
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
    if (!confirm('Delete this gallery image?')) return;
    try {
      await adminApi.gallery.remove(id);
      await bustCache();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= images.length) return;
    const next = [...images];
    const item = next[index];
    const swapWith = next[nextIndex];
    if (!item || !swapWith) return;
    next[index] = swapWith;
    next[nextIndex] = item;
    setImages(next);
    try {
      const { images: updated } = await adminApi.gallery.reorder(next.map((c) => c.id));
      setImages(updated);
      await bustCache();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reorder failed');
      await load();
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Company Gallery"
        description="Photos, activities, projects, and events shown on the public Gallery page."
        actions={
          <AdminButton
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm(images.length + 1));
              setOpen(true);
            }}
          >
            Add image
          </AdminButton>
        }
      />
      {error && <p className="mb-4 text-[0.875rem] text-error">{error}</p>}

      {images.length === 0 ? (
        <EmptyState message="No gallery images yet. Upload a photo with a title and category." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {images.map((item, index) => (
            <AdminCard key={item.id} className="flex flex-col">
              <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-[12px] border border-border bg-bg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-[1.0625rem] text-navy">{item.title}</h3>
                  <p className="mt-1 text-[0.75rem] uppercase tracking-[0.12em] text-muted">
                    {CATEGORIES.find((c) => c.id === item.category)?.label ?? item.category}
                  </p>
                  {item.description && (
                    <p className="mt-1 line-clamp-2 text-[0.875rem] text-muted">{item.description}</p>
                  )}
                  <div className="mt-3">
                    <StatusBadge status={item.status} />
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
                      disabled={index === images.length - 1}
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
                        setEditingId(item.id);
                        setForm({
                          title: item.title,
                          description: item.description ?? '',
                          image: item.image,
                          category: item.category,
                          order: item.order,
                          status: (item.status as 'DRAFT' | 'PUBLISHED') ?? 'PUBLISHED',
                        });
                        setOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button type="button" className="text-error" onClick={() => void remove(item.id)}>
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
          <h2 className="text-[1.25rem] text-navy">{editingId ? 'Edit image' : 'New gallery image'}</h2>
          <AdminInput
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <AdminTextarea
            label="Description (optional)"
            rows={3}
            value={form.description ?? ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <ImageUploadField
            label="Image"
            value={form.image}
            onChange={(image) => setForm({ ...form, image })}
            onError={setError}
          />
          <div className="grid grid-cols-3 gap-4">
            <AdminSelect
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as GalleryCategory })}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </AdminSelect>
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
