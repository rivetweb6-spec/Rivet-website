'use client';

import * as React from 'react';
import {
  adminApi,
  type AdminProduct,
  type Category,
  type ProductInput,
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
import {
  emptySeoFields,
  pickSeoFields,
  seoPayload,
  SeoFieldsPanel,
} from '@/components/admin/seo-fields-panel';

const emptyForm = (): ProductInput & { imageUrls: string } => ({
  name: '',
  categoryId: '',
  shortDescription: '',
  description: '',
  brand: '',
  countryOfOrigin: '',
  features: [],
  featured: false,
  status: 'PUBLISHED',
  imageUrls: '',
  ...emptySeoFields(),
});

export default function AdminProductsPage() {
  const [products, setProducts] = React.useState<AdminProduct[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [form, setForm] = React.useState(emptyForm());
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    const [p, c] = await Promise.all([adminApi.products.list(), adminApi.categories.list()]);
    setProducts(p.products);
    setCategories(c.categories);
  }, []);

  React.useEffect(() => {
    load().catch((e: Error) => setError(e.message));
  }, [load]);

  const startCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm(),
      categoryId: categories[0]?.id ?? '',
    });
    setOpen(true);
  };

  const startEdit = (p: AdminProduct) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      categoryId: p.categoryId,
      shortDescription: p.shortDescription ?? '',
      description: p.description ?? '',
      brand: p.brand ?? '',
      countryOfOrigin: p.countryOfOrigin ?? '',
      features: p.features ?? [],
      featured: p.featured,
      status: (p.status as 'DRAFT' | 'PUBLISHED') ?? 'PUBLISHED',
      imageUrls: p.images.map((i) => i.url).join('\n'),
      specs: p.specs ?? [],
      ...pickSeoFields(p),
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const images = form.imageUrls
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((url) => ({ url }));
      const payload: ProductInput = {
        name: form.name,
        categoryId: form.categoryId,
        shortDescription: form.shortDescription || undefined,
        description: form.description || undefined,
        brand: form.brand || undefined,
        countryOfOrigin: form.countryOfOrigin || undefined,
        features: form.features,
        featured: form.featured,
        status: form.status,
        images: images.length ? images : undefined,
        specs: form.specs,
        ...seoPayload(pickSeoFields(form)),
      };
      if (editingId) await adminApi.products.update(editingId, payload);
      else await adminApi.products.create(payload);
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await adminApi.products.remove(id);
    await load();
  };

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description="Manage catalog items and imagery."
        actions={<AdminButton onClick={startCreate}>Add product</AdminButton>}
      />
      {error && <p className="mb-4 text-[0.875rem] text-error">{error}</p>}

      <AdminCard className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left text-[0.875rem]">
          <thead className="border-b border-divider bg-bg/80 text-[0.75rem] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Featured</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EmptyState message="No products yet." />
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="border-b border-divider last:border-0">
                <td className="px-5 py-3 font-medium text-ink">{p.name}</td>
                <td className="px-5 py-3 text-muted">{p.category?.name ?? '—'}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-5 py-3 text-muted">{p.featured ? 'Yes' : 'No'}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    className="mr-3 text-navy hover:text-gold"
                    onClick={() => startEdit(p)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-error hover:underline"
                    onClick={() => remove(p.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminCard>

      <AdminModal open={open} onClose={() => setOpen(false)} className="max-w-2xl">
        <form onSubmit={save}>
          <h2 className="text-[1.25rem] text-navy">
            {editingId ? 'Edit product' : 'New product'}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <AdminInput
              label="Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <AdminSelect
              label="Category"
              required
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </AdminSelect>
            <AdminInput
              label="Brand"
              value={form.brand ?? ''}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
            <AdminInput
              label="Country of origin"
              value={form.countryOfOrigin ?? ''}
              onChange={(e) => setForm({ ...form, countryOfOrigin: e.target.value })}
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
            <label className="flex items-end gap-2 pb-3 text-[0.875rem]">
              <input
                type="checkbox"
                checked={!!form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              Featured
            </label>
          </div>
          <div className="mt-4 space-y-4">
            <AdminInput
              label="Short description"
              value={form.shortDescription ?? ''}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            />
            <AdminTextarea
              label="Full description"
              rows={4}
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <AdminInput
              label="Features (comma-separated)"
              value={(form.features ?? []).join(', ')}
              onChange={(e) =>
                setForm({
                  ...form,
                  features: e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
            <ImageUploadField
              label="Product images"
              multiple
              value={form.imageUrls}
              onChange={(imageUrls) => setForm({ ...form, imageUrls })}
              onError={(msg) => setError(msg)}
            />
          </div>
          <SeoFieldsPanel
            value={form}
            onChange={(seo) => setForm({ ...form, ...seo })}
            fallbackTitle={`${form.name || 'Product'} in Ethiopia | Rivet`}
            fallbackDescription={
              form.shortDescription ||
              `Explore ${form.name || 'this product'} from Rivet. Request a quotation for premium products in Ethiopia.`
            }
            fallbackImage={form.imageUrls.split('\n').map((s) => s.trim()).find(Boolean)}
            pathPreview={`/products/${form.slug || 'product-slug'}`}
          />
          <div className="mt-6 flex justify-end gap-3">
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
