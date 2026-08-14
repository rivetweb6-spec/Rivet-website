'use client';

import * as React from 'react';
import { adminApi, revalidatePublicCache, type AdminArticle, type ArticleInput } from '@/lib/admin-api';
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
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import {
  emptySeoFields,
  pickSeoFields,
  seoPayload,
  SeoFieldsPanel,
} from '@/components/admin/seo-fields-panel';

export default function AdminNewsPage() {
  const [articles, setArticles] = React.useState<AdminArticle[]>([]);
  const [form, setForm] = React.useState<ArticleInput>({
    title: '',
    excerpt: '',
    body: '',
    coverImage: '',
    category: 'Company',
    status: 'DRAFT',
    ...emptySeoFields(),
  });
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = () => adminApi.news.list().then((r) => setArticles(r.articles));

  React.useEffect(() => {
    load().catch((e: Error) => setError(e.message));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: ArticleInput = {
        title: form.title,
        excerpt: form.excerpt || undefined,
        body: form.body,
        coverImage: form.coverImage || null,
        category: form.category || undefined,
        status: form.status,
        ...seoPayload(pickSeoFields(form)),
      };
      if (editingId) await adminApi.news.update(editingId, payload);
      else await adminApi.news.create(payload);
      try {
        await revalidatePublicCache('news');
      } catch {
        /* public cache will refresh on the next ISR window */
      }
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    await adminApi.news.remove(id);
    try {
      await revalidatePublicCache('news');
    } catch {
      /* public cache will refresh on the next ISR window */
    }
    await load();
  };

  return (
    <div>
      <AdminPageHeader
        title="News"
        description="Publish and edit journal articles."
        actions={
          <AdminButton
            onClick={() => {
              setEditingId(null);
              setForm({
                title: '',
                excerpt: '',
                body: '',
                coverImage: '',
                category: 'Company',
                status: 'DRAFT',
                ...emptySeoFields(),
              });
              setOpen(true);
            }}
          >
            New article
          </AdminButton>
        }
      />
      {error && <p className="mb-4 text-[0.875rem] text-error">{error}</p>}

      <AdminCard className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-left text-[0.875rem]">
          <thead className="border-b border-divider bg-bg/80 text-[0.75rem] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <EmptyState message="No articles yet." />
                </td>
              </tr>
            )}
            {articles.map((a) => (
              <tr key={a.id} className="border-b border-divider last:border-0">
                <td className="px-5 py-3 font-medium">{a.title}</td>
                <td className="px-5 py-3 text-muted">{a.category ?? '—'}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={a.status} />
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    className="mr-3 text-navy hover:text-gold"
                    onClick={() => {
                      setEditingId(a.id);
                      setForm({
                        title: a.title,
                        excerpt: a.excerpt ?? '',
                        body: a.body,
                        coverImage: a.coverImage ?? '',
                        category: a.category ?? '',
                        status: (a.status as 'DRAFT' | 'PUBLISHED') ?? 'DRAFT',
                        ...pickSeoFields(a),
                      });
                      setOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button type="button" className="text-error" onClick={() => remove(a.id)}>
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
            {editingId ? 'Edit article' : 'New article'}
          </h2>
          <AdminInput
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              label="Category"
              value={form.category ?? ''}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <AdminSelect
              label="Status"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as 'DRAFT' | 'PUBLISHED' })
              }
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </AdminSelect>
          </div>
          <ImageUploadField
            label="Cover image"
            value={form.coverImage ?? ''}
            onChange={(coverImage) => setForm({ ...form, coverImage })}
            onError={(msg) => setError(msg)}
          />
          <AdminTextarea
            label="Excerpt"
            rows={2}
            value={form.excerpt ?? ''}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          />
          <label className="block">
            <span className="mb-1.5 block text-[0.8125rem] font-medium text-ink">Body</span>
            <RichTextEditor
              key={editingId ?? 'new'}
              value={form.body}
              onChange={(body) => setForm({ ...form, body })}
            />
          </label>
          <SeoFieldsPanel
            value={form}
            onChange={(seo) => setForm({ ...form, ...seo })}
            fallbackTitle={form.title || 'News article'}
            fallbackDescription={form.excerpt || 'RIVET news and insights.'}
            fallbackImage={form.coverImage ?? undefined}
            pathPreview={`/news/${form.slug || 'article-slug'}`}
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
