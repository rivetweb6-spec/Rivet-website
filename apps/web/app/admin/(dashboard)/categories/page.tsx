'use client';

import * as React from 'react';
import { adminApi, type Category } from '@/lib/admin-api';
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminModal,
  AdminPageHeader,
  AdminSelect,
  AdminTextarea,
  EmptyState,
} from '@/components/admin/ui';

import {
  emptySeoFields,
  pickSeoFields,
  seoPayload,
  SeoFieldsPanel,
} from '@/components/admin/seo-fields-panel';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import type { FaqItem, SeoFieldsInput } from '@/lib/admin-api';

type CategoryForm = {
  name: string;
  description: string;
  image: string;
  order: number;
  faqsText: string;
} & SeoFieldsInput;

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

function productCountOf(category: Category) {
  return category._count?.products ?? 0;
}

function productLabel(count: number) {
  return `${count} product${count === 1 ? '' : 's'}`;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [form, setForm] = React.useState<CategoryForm>({
    name: '',
    description: '',
    image: '',
    order: 0,
    faqsText: '',
    ...emptySeoFields(),
  });
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState<Category | null>(null);
  const [reassignTo, setReassignTo] = React.useState('');
  const [deletingBusy, setDeletingBusy] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const load = () =>
    adminApi.categories.list().then((r) => setCategories(r.categories));

  React.useEffect(() => {
    load().catch((e: Error) => setError(e.message));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const faqs = textToFaqs(form.faqsText);
      const payload = {
        name: form.name,
        description: form.description || undefined,
        image: form.image || null,
        order: Number(form.order) || 0,
        faqs: faqs.length ? faqs : null,
        ...seoPayload(pickSeoFields(form)),
      };
      if (editingId) await adminApi.categories.update(editingId, payload);
      else await adminApi.categories.create(payload);
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const deletingProductCount = deleting ? productCountOf(deleting) : 0;
  const otherCategories = deleting
    ? categories.filter((c) => c.id !== deleting.id)
    : [];
  const canConfirmDelete =
    !!deleting &&
    !deletingBusy &&
    (deletingProductCount === 0 || Boolean(reassignTo));

  const openDelete = (category: Category) => {
    setDeleteError(null);
    setDeleting(category);
    setReassignTo('');
  };

  const closeDelete = () => {
    if (deletingBusy) return;
    setDeleting(null);
    setReassignTo('');
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!deleting || !canConfirmDelete) return;
    setDeletingBusy(true);
    setDeleteError(null);
    try {
      await adminApi.categories.remove(
        deleting.id,
        deletingProductCount > 0 ? reassignTo : undefined,
      );
      setDeleting(null);
      setReassignTo('');
      await load();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingBusy(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Product department taxonomy."
        actions={
          <AdminButton
            onClick={() => {
              setEditingId(null);
              setForm({
                name: '',
                description: '',
                image: '',
                order: categories.length + 1,
                faqsText: '',
                ...emptySeoFields(),
              });
              setOpen(true);
            }}
          >
            Add category
          </AdminButton>
        }
      />
      {error && <p className="mb-4 text-[0.875rem] text-error">{error}</p>}

      <AdminCard className="overflow-x-auto p-0">
        <table className="w-full min-w-[560px] text-left text-[0.875rem]">
          <thead className="border-b border-divider bg-bg/80 text-[0.75rem] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Slug</th>
              <th className="px-5 py-3 font-medium">Products</th>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EmptyState message="No categories yet." />
                </td>
              </tr>
            )}
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-divider last:border-0">
                <td className="px-5 py-3 font-medium">{c.name}</td>
                <td className="px-5 py-3 text-muted">{c.slug}</td>
                <td className="px-5 py-3 text-muted">{productCountOf(c)}</td>
                <td className="px-5 py-3 text-muted">{c.order}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    className="mr-3 text-navy hover:text-gold"
                    onClick={() => {
                      setEditingId(c.id);
                      setForm({
                        name: c.name,
                        description: c.description ?? '',
                        image: c.image ?? '',
                        order: c.order,
                        faqsText: faqsToText(c.faqs),
                        ...pickSeoFields(c),
                      });
                      setOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-error"
                    onClick={() => openDelete(c)}
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
        <form onSubmit={save} className="space-y-4">
          <h2 className="text-[1.25rem] text-navy">
            {editingId ? 'Edit category' : 'New category'}
          </h2>
          <AdminInput
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <AdminTextarea
            label="Description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <ImageUploadField
            label="Category image"
            value={form.image}
            onChange={(image) => setForm({ ...form, image })}
            onError={setError}
          />
          <AdminInput
            label="Order"
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
          />
          <AdminTextarea
            label="FAQs (question on first line, answer below; blank line between items)"
            rows={6}
            value={form.faqsText}
            onChange={(e) => setForm({ ...form, faqsText: e.target.value })}
          />
          <SeoFieldsPanel
            value={form}
            onChange={(seo) => setForm({ ...form, ...seo })}
            fallbackTitle={`Premium ${form.name || 'Category'} in Ethiopia | Rivet`}
            fallbackDescription={
              form.description ||
              `Explore high-quality ${(form.name || 'products').toLowerCase()} from Rivet in Ethiopia.`
            }
            fallbackImage={form.image}
            pathPreview={`/products/${form.slug || 'category-slug'}`}
          />
          <div className="flex justify-end gap-3">
            <AdminButton type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit">Save</AdminButton>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        open={!!deleting}
        onClose={closeDelete}
        className="max-w-md"
        labelledBy="delete-category-title"
      >
        <div className="space-y-4">
          <h2 id="delete-category-title" className="text-[1.25rem] text-navy">
            Delete category
          </h2>
          {deleteError && <p className="text-[0.875rem] text-error">{deleteError}</p>}
          {deleting && deletingProductCount === 0 && (
            <p className="text-[0.9375rem] text-muted">
              Delete <span className="font-medium text-ink">{deleting.name}</span>? This cannot be
              undone.
            </p>
          )}
          {deleting && deletingProductCount > 0 && (
            <>
              <p className="rounded-[12px] border border-warning/30 bg-warning/10 p-3 text-[0.875rem] text-ink">
                <span className="font-medium">{deleting.name}</span> is used by{' '}
                {productLabel(deletingProductCount)}. Reassign{' '}
                {deletingProductCount === 1 ? 'it' : 'them'} to another category before deleting.
                Products will not be removed.
              </p>
              {otherCategories.length === 0 ? (
                <p className="text-[0.875rem] text-muted">
                  Create another category first, then reassign these products to it. A category
                  that still has products cannot be deleted.
                </p>
              ) : (
                <AdminSelect
                  label="Move products to"
                  required
                  value={reassignTo}
                  onChange={(e) => setReassignTo(e.target.value)}
                >
                  <option value="">Select a category</option>
                  {otherCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </AdminSelect>
              )}
            </>
          )}
          <div className="flex justify-end gap-3">
            <AdminButton type="button" variant="ghost" onClick={closeDelete} disabled={deletingBusy}>
              Cancel
            </AdminButton>
            <AdminButton
              type="button"
              variant="danger"
              onClick={() => void confirmDelete()}
              disabled={!canConfirmDelete}
            >
              {deletingBusy ? 'Deleting…' : 'Delete category'}
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
