'use client';

import * as React from 'react';
import { adminApi, type Category } from '@/lib/admin-api';
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminModal,
  AdminPageHeader,
  AdminTextarea,
  EmptyState,
} from '@/components/admin/ui';

import {
  emptySeoFields,
  pickSeoFields,
  seoPayload,
  SeoFieldsPanel,
} from '@/components/admin/seo-fields-panel';
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
        image: form.image || undefined,
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

  const remove = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await adminApi.categories.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
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
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <EmptyState message="No categories yet." />
                </td>
              </tr>
            )}
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-divider last:border-0">
                <td className="px-5 py-3 font-medium">{c.name}</td>
                <td className="px-5 py-3 text-muted">{c.slug}</td>
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
                    onClick={() => remove(c.id)}
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
          <AdminInput
            label="Image URL"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
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
    </div>
  );
}
