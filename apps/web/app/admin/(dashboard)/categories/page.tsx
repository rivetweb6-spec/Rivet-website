'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  ExternalLink,
  ImageIcon,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { adminApi, revalidatePublicCache, type Category } from '@/lib/admin-api';
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
import { cn } from '@/lib/utils';

/**
 * Department (level 0) → group (level 1) → subcategory (level 2).
 * The public products pages render exactly these three levels, so deeper
 * nesting is not offered here.
 */
const MAX_LEVEL = 2;

type CategoryForm = {
  name: string;
  parentId: string;
  description: string;
  image: string;
  faqsText: string;
} & SeoFieldsInput;

type TreeNode = Category & {
  childrenNodes: TreeNode[];
  level: number;
  path: string;
  totalProducts: number;
  /** Levels below this node (0 = leaf). */
  height: number;
  issues: string[];
};

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

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}

function issuesOf(category: Category): string[] {
  const issues: string[] = [];
  if (!category.image) issues.push('No image');
  if (!category.description?.trim()) issues.push('No description');
  return issues;
}

function byOrder(a: Category, b: Category) {
  return a.order - b.order || a.name.localeCompare(b.name);
}

function emptyForm(parentId = ''): CategoryForm {
  return { name: '', parentId, description: '', image: '', faqsText: '', ...emptySeoFields() };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [pageError, setPageError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [attentionOnly, setAttentionOnly] = React.useState(false);
  const [collapsedIds, setCollapsedIds] = React.useState<Set<string>>(new Set());
  const [reordering, setReordering] = React.useState(false);

  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<CategoryForm>(emptyForm());
  const [formError, setFormError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const [deleting, setDeleting] = React.useState<TreeNode | null>(null);
  const [reassignTo, setReassignTo] = React.useState('');
  const [deletingBusy, setDeletingBusy] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const r = await adminApi.categories.list();
    setCategories(r.categories);
    setLoaded(true);
  }, []);

  React.useEffect(() => {
    load().catch((e: Error) => {
      setPageError(e.message);
      setLoaded(true);
    });
  }, [load]);

  // ---------------------------------------------------------------- tree
  const { roots, nodeById, flatNodes } = React.useMemo(() => {
    const map = new Map<string, TreeNode>();
    for (const c of categories) {
      map.set(c.id, {
        ...c,
        childrenNodes: [],
        level: 0,
        path: c.name,
        totalProducts: 0,
        height: 0,
        issues: issuesOf(c),
      });
    }

    const top: TreeNode[] = [];
    for (const node of map.values()) {
      const parent = node.parentId ? map.get(node.parentId) : undefined;
      if (parent) parent.childrenNodes.push(node);
      else top.push(node); // includes orphans whose parent no longer exists
    }

    const setup = (node: TreeNode, level: number, parentPath: string) => {
      node.level = level;
      node.path = parentPath ? `${parentPath} › ${node.name}` : node.name;
      node.childrenNodes.sort(byOrder);
      let total = productCountOf(node);
      let height = 0;
      for (const child of node.childrenNodes) {
        setup(child, level + 1, node.path);
        total += child.totalProducts;
        height = Math.max(height, child.height + 1);
      }
      node.totalProducts = total;
      node.height = height;
    };

    top.sort(byOrder);
    for (const root of top) setup(root, 0, '');

    const flat: TreeNode[] = [];
    const collect = (nodes: TreeNode[]) => {
      for (const n of nodes) {
        flat.push(n);
        collect(n.childrenNodes);
      }
    };
    collect(top);

    return { roots: top, nodeById: map, flatNodes: flat };
  }, [categories]);

  const siblingsOf = React.useCallback(
    (node: TreeNode) =>
      node.parentId && nodeById.has(node.parentId)
        ? nodeById.get(node.parentId)!.childrenNodes
        : roots,
    [nodeById, roots],
  );

  const attentionCount = flatNodes.filter((n) => n.issues.length > 0).length;
  const totalProducts = roots.reduce((sum, r) => sum + r.totalProducts, 0);

  // ---------------------------------------------------------- filtering
  const visibleRows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtering = Boolean(q) || attentionOnly;

    const selfMatches = (n: TreeNode) =>
      (!q || n.name.toLowerCase().includes(q) || n.slug.toLowerCase().includes(q)) &&
      (!attentionOnly || n.issues.length > 0);

    const subtreeMatches = (n: TreeNode): boolean =>
      selfMatches(n) || n.childrenNodes.some(subtreeMatches);

    const rows: TreeNode[] = [];
    const walk = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        if (filtering && !subtreeMatches(node)) continue;
        rows.push(node);
        // While filtering, always open the path to matches.
        if (filtering || !collapsedIds.has(node.id)) walk(node.childrenNodes);
      }
    };
    walk(roots);
    return rows;
  }, [roots, collapsedIds, search, attentionOnly]);

  const expandableIds = flatNodes.filter((n) => n.childrenNodes.length > 0).map((n) => n.id);
  const allCollapsed =
    expandableIds.length > 0 && expandableIds.every((id) => collapsedIds.has(id));

  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ----------------------------------------------------------- reorder
  const move = async (node: TreeNode, direction: -1 | 1) => {
    const siblings = siblingsOf(node);
    const index = siblings.findIndex((s) => s.id === node.id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= siblings.length || reordering) return;

    const ids = siblings.map((s) => s.id);
    [ids[index], ids[target]] = [ids[target]!, ids[index]!];

    // Optimistic: apply the new order locally, then persist.
    const newOrder = new Map(ids.map((id, i) => [id, i + 1]));
    setCategories((prev) =>
      prev.map((c) => (newOrder.has(c.id) ? { ...c, order: newOrder.get(c.id)! } : c)),
    );
    setReordering(true);
    setPageError(null);
    try {
      await adminApi.categories.reorder(ids);
      await revalidatePublicCache('categories');
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Could not save the new order');
      await load().catch(() => undefined);
    } finally {
      setReordering(false);
    }
  };

  // -------------------------------------------------------- create/edit
  const editingNode = editingId ? nodeById.get(editingId) : undefined;

  const parentOptions = React.useMemo(() => {
    const blocked = new Set<string>();
    if (editingNode) {
      const stack: TreeNode[] = [editingNode];
      while (stack.length) {
        const n = stack.pop()!;
        blocked.add(n.id);
        stack.push(...n.childrenNodes);
      }
    }
    const height = editingNode?.height ?? 0;
    return flatNodes.filter((n) => !blocked.has(n.id) && n.level + 1 + height <= MAX_LEVEL);
  }, [flatNodes, editingNode]);

  const openCreate = (parentId?: string) => {
    setEditingId(null);
    setForm(emptyForm(parentId));
    setFormError(null);
    setOpen(true);
  };

  const openEdit = (c: TreeNode) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      parentId: c.parentId ?? '',
      description: c.description ?? '',
      image: c.image ?? '',
      faqsText: faqsToText(c.faqs),
      ...pickSeoFields(c),
    });
    setFormError(null);
    setOpen(true);
  };

  const closeForm = () => {
    if (!saving) setOpen(false);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      const parentId = form.parentId.trim() || null;
      const parentChanged = !editingNode || (editingNode.parentId ?? null) !== parentId;
      const newSiblings = parentId ? (nodeById.get(parentId)?.childrenNodes ?? []) : roots;
      const faqs = textToFaqs(form.faqsText);
      const seo = seoPayload(pickSeoFields(form));

      const payload: Partial<Category> & { name: string } = {
        ...seo,
        name: form.name.trim(),
        slug: form.slug?.trim() || undefined,
        parentId,
        description: form.description.trim() || null,
        image: form.image || null,
        faqs: faqs.length ? faqs : null,
        // New items and moved items go to the end of their new list.
        ...(parentChanged ? { order: newSiblings.length + 1 } : {}),
      };

      if (editingId) await adminApi.categories.update(editingId, payload);
      else await adminApi.categories.create(payload);

      await revalidatePublicCache('categories');
      if (parentId) {
        setCollapsedIds((prev) => {
          const next = new Set(prev);
          next.delete(parentId);
          return next;
        });
      }
      setOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------------------ delete
  const deletingProductCount = deleting ? productCountOf(deleting) : 0;
  const deletingChildren = deleting?.childrenNodes ?? [];
  const hasSubcategoryBlocker = deletingChildren.length > 0;
  const reassignOptions = deleting ? flatNodes.filter((n) => n.id !== deleting.id) : [];
  const canConfirmDelete =
    !!deleting &&
    !deletingBusy &&
    !hasSubcategoryBlocker &&
    (deletingProductCount === 0 || Boolean(reassignTo));

  const openDelete = (node: TreeNode) => {
    setDeleteError(null);
    setReassignTo('');
    setDeleting(node);
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
      await revalidatePublicCache('categories');
      setDeleting(null);
      setReassignTo('');
      await load();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingBusy(false);
    }
  };

  // ------------------------------------------------------------ render
  const formParent = form.parentId ? nodeById.get(form.parentId) : undefined;
  const formTitle = editingNode
    ? `Edit ${editingNode.name}`
    : formParent
      ? `New subcategory in ${formParent.name}`
      : 'New department';

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Departments and subcategories shown on the website’s Products pages. Changes go live immediately."
        actions={
          <AdminButton onClick={() => openCreate()}>
            <Plus size={16} aria-hidden="true" />
            Add department
          </AdminButton>
        }
      />

      {pageError && (
        <div
          role="alert"
          className="mb-4 rounded-[10px] border border-error/20 bg-error/10 p-3 text-[0.875rem] text-error"
        >
          {pageError}
        </div>
      )}

      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Departments" value={roots.length} />
        <Stat label="Subcategories" value={categories.length - roots.length} />
        <Stat label="Products" value={totalProducts} />
        <button
          type="button"
          onClick={() => setAttentionOnly((v) => !v)}
          aria-pressed={attentionOnly}
          className={cn(
            'rounded-[14px] border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
            attentionOnly
              ? 'border-warning bg-warning/10'
              : 'border-border bg-surface hover:border-warning/60',
          )}
        >
          <span className="block text-[0.75rem] font-medium uppercase tracking-wider text-muted">
            Need attention
          </span>
          <span className="mt-1 flex items-center gap-2 text-[1.5rem] font-semibold text-navy">
            {attentionCount}
            {attentionCount > 0 && (
              <AlertTriangle size={18} className="text-warning" aria-hidden="true" />
            )}
          </span>
          <span className="block text-[0.75rem] text-muted">
            {attentionOnly ? 'Showing only these · click to show all' : 'Missing image or description'}
          </span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block max-w-sm flex-1">
          <span className="sr-only">Search categories</span>
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search by name or URL…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-[10px] border border-border bg-surface pl-9 pr-3 text-[0.875rem] text-ink placeholder:text-muted/70 focus:border-gold focus:outline-none"
          />
        </label>
        {expandableIds.length > 0 && (
          <AdminButton
            variant="ghost"
            onClick={() => setCollapsedIds(allCollapsed ? new Set() : new Set(expandableIds))}
          >
            {allCollapsed ? (
              <ChevronsUpDown size={16} aria-hidden="true" />
            ) : (
              <ChevronsDownUp size={16} aria-hidden="true" />
            )}
            {allCollapsed ? 'Expand all' : 'Collapse all'}
          </AdminButton>
        )}
      </div>

      <AdminCard className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left text-[0.875rem]">
          <thead className="border-b border-border bg-bg/80 text-[0.75rem] uppercase tracking-wider text-muted">
            <tr>
              <th scope="col" className="px-5 py-3 font-medium">
                Category
              </th>
              <th scope="col" className="w-28 px-4 py-3 font-medium">
                Products
              </th>
              <th scope="col" className="w-[17rem] px-5 py-3 text-right font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loaded && categories.length === 0 && (
              <tr>
                <td colSpan={3}>
                  <EmptyState message="No categories yet. Click “Add department” to create the first one." />
                </td>
              </tr>
            )}

            {categories.length > 0 && visibleRows.length === 0 && (
              <tr>
                <td colSpan={3} className="p-10 text-center text-muted">
                  {attentionOnly && !search
                    ? 'Every category has an image and a description.'
                    : `No categories match “${search}”.`}
                </td>
              </tr>
            )}

            {visibleRows.map((node) => {
              const hasChildren = node.childrenNodes.length > 0;
              const isCollapsed = collapsedIds.has(node.id) && !search && !attentionOnly;
              const siblings = siblingsOf(node);
              const index = siblings.findIndex((s) => s.id === node.id);
              const isRoot = node.level === 0;

              return (
                <tr
                  key={node.id}
                  className={cn(
                    'border-b border-divider/60 transition-colors last:border-0 hover:bg-pearl/40',
                    isRoot && 'bg-pearl/25',
                  )}
                >
                  <td className="py-3 pr-4" style={{ paddingLeft: `${1.25 + node.level * 2}rem` }}>
                    <div className="flex items-center gap-3">
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() => toggleCollapse(node.id)}
                          aria-expanded={!isCollapsed}
                          aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${node.name}`}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-muted hover:bg-black/5 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        >
                          {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                        </button>
                      ) : (
                        <span className="w-7 shrink-0" aria-hidden="true" />
                      )}

                      <Thumb key={node.image ?? 'none'} src={node.image} />

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <button
                            type="button"
                            onClick={() => openEdit(node)}
                            className={cn(
                              'text-left text-navy transition-colors hover:text-gold focus-visible:outline-none focus-visible:underline',
                              isRoot ? 'text-[0.9375rem] font-semibold' : 'font-medium',
                            )}
                          >
                            {node.name}
                          </button>
                          {isRoot && (
                            <span className="rounded-full bg-navy/10 px-2 py-0.5 text-[0.6875rem] font-medium text-navy">
                              Department
                            </span>
                          )}
                          {hasChildren && (
                            <span className="text-[0.75rem] text-muted">
                              {plural(node.childrenNodes.length, 'subcategory', 'subcategories')}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem] text-muted">
                          <span className="font-mono">/products/{node.slug}</span>
                          {node.issues.map((issue) => (
                            <span
                              key={issue}
                              className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 font-medium text-ink"
                            >
                              <AlertTriangle size={11} className="text-warning" aria-hidden="true" />
                              {issue}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 tabular-nums">
                    {node.totalProducts > 0 ? (
                      <span className="font-medium text-ink">{node.totalProducts}</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-0.5">
                      <IconAction
                        label={`Move ${node.name} up`}
                        onClick={() => void move(node, -1)}
                        disabled={index <= 0 || reordering || !!search || attentionOnly}
                      >
                        <ArrowUp size={16} />
                      </IconAction>
                      <IconAction
                        label={`Move ${node.name} down`}
                        onClick={() => void move(node, 1)}
                        disabled={
                          index >= siblings.length - 1 || reordering || !!search || attentionOnly
                        }
                      >
                        <ArrowDown size={16} />
                      </IconAction>
                      <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
                      {node.level < MAX_LEVEL ? (
                        <IconAction
                          label={`Add subcategory to ${node.name}`}
                          onClick={() => openCreate(node.id)}
                        >
                          <Plus size={16} />
                        </IconAction>
                      ) : (
                        <span className="h-8 w-8" aria-hidden="true" />
                      )}
                      <IconAction label={`View ${node.name} on the website`} href={`/products/${node.slug}`}>
                        <ExternalLink size={16} />
                      </IconAction>
                      <IconAction label={`Edit ${node.name}`} onClick={() => openEdit(node)}>
                        <Pencil size={16} />
                      </IconAction>
                      <IconAction
                        label={`Delete ${node.name}`}
                        onClick={() => openDelete(node)}
                        tone="danger"
                      >
                        <Trash2 size={16} />
                      </IconAction>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </AdminCard>

      {(search || attentionOnly) && visibleRows.length > 0 && (
        <p className="mt-3 text-[0.8125rem] text-muted">
          Reordering is turned off while a search or filter is active.
        </p>
      )}

      {/* Add / edit */}
      <AdminModal open={open} onClose={closeForm} className="max-w-2xl" labelledBy="category-form-title">
        <form onSubmit={save} className="space-y-5">
          <div>
            <h2 id="category-form-title" className="text-[1.25rem] font-semibold text-navy">
              {formTitle}
            </h2>
            <p className="mt-1 text-[0.8125rem] text-muted">
              {form.parentId
                ? 'Subcategories appear as cards on their parent’s page.'
                : 'Departments appear in the Products menu and on the Products page.'}
            </p>
          </div>

          {formError && (
            <div
              role="alert"
              className="rounded-[10px] border border-error/20 bg-error/10 p-3 text-[0.875rem] text-error"
            >
              {formError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              label="Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Panoramic Elevators"
            />
            <AdminSelect
              label="Belongs to"
              value={form.parentId}
              onChange={(e) => setForm({ ...form, parentId: e.target.value })}
            >
              <option value="">Nothing — it’s a top-level department</option>
              {parentOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.path}
                </option>
              ))}
            </AdminSelect>
          </div>

          <div>
            <AdminTextarea
              label="Description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="One or two sentences describing what customers will find here."
            />
            <p className="mt-1 text-[0.75rem] text-muted">
              Shown on the category card and at the top of its page.
            </p>
          </div>

          <div>
            <ImageUploadField
              label="Cover image"
              value={form.image}
              onChange={(image) => setForm({ ...form, image })}
              onError={setFormError}
            />
            <p className="mt-1 text-[0.75rem] text-muted">
              Use a real product or installation photo in landscape format, at least 1600px wide.
            </p>
          </div>

          <Disclosure title="FAQs" hint="Optional — shown at the bottom of the category page">
            <AdminTextarea
              label="Questions and answers"
              rows={6}
              value={form.faqsText}
              onChange={(e) => setForm({ ...form, faqsText: e.target.value })}
              placeholder={'Do you install panoramic elevators?\nYes — our team handles supply, installation and maintenance.\n\nHow long does installation take?\nTypically 4–8 weeks depending on the building.'}
            />
            <p className="mt-1 text-[0.75rem] text-muted">
              Question on the first line, answer below it. Leave a blank line between questions.
            </p>
          </Disclosure>

          <Disclosure title="URL & SEO" hint="Optional — filled in automatically when left blank">
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
          </Disclosure>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <AdminButton type="button" variant="ghost" onClick={closeForm} disabled={saving}>
              Cancel
            </AdminButton>
            <AdminButton type="submit" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create'}
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      {/* Delete */}
      <AdminModal
        open={!!deleting}
        onClose={closeDelete}
        className="max-w-md"
        labelledBy="delete-category-title"
      >
        <div className="space-y-4">
          <h2 id="delete-category-title" className="text-[1.25rem] font-semibold text-navy">
            Delete {deleting?.name}
          </h2>

          {deleteError && (
            <p role="alert" className="text-[0.875rem] text-error">
              {deleteError}
            </p>
          )}

          {hasSubcategoryBlocker && (
            <div className="rounded-[10px] border border-warning/30 bg-warning/10 p-3.5 text-[0.875rem] text-ink">
              <p className="mb-1 font-semibold">Remove its subcategories first</p>
              <p>
                {deleting?.name} still contains{' '}
                {plural(deletingChildren.length, 'subcategory', 'subcategories')}:{' '}
                <span className="font-medium">
                  {deletingChildren.map((c) => c.name).join(', ')}
                </span>
                . Delete them or move them to another category (Edit → “Belongs to”).
              </p>
            </div>
          )}

          {!hasSubcategoryBlocker && deleting && deletingProductCount > 0 && (
            <>
              <p className="rounded-[10px] border border-warning/30 bg-warning/10 p-3 text-[0.875rem] text-ink">
                {plural(deletingProductCount, 'product is', 'products are')} in{' '}
                <span className="font-medium">{deleting.name}</span>. Choose where to move{' '}
                {deletingProductCount === 1 ? 'it' : 'them'} — no products will be deleted.
              </p>
              {reassignOptions.length === 0 ? (
                <p className="text-[0.875rem] text-muted">
                  Create another category first, then move these products to it.
                </p>
              ) : (
                <AdminSelect
                  label="Move products to"
                  required
                  value={reassignTo}
                  onChange={(e) => setReassignTo(e.target.value)}
                >
                  <option value="">Select a category</option>
                  {reassignOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.path}
                    </option>
                  ))}
                </AdminSelect>
              )}
            </>
          )}

          {!hasSubcategoryBlocker && deleting && deletingProductCount === 0 && (
            <p className="text-[0.9375rem] text-muted">
              Its page will be removed from the website. This cannot be undone.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <AdminButton type="button" variant="ghost" onClick={closeDelete} disabled={deletingBusy}>
              Cancel
            </AdminButton>
            {!hasSubcategoryBlocker && (
              <AdminButton
                type="button"
                variant="danger"
                onClick={() => void confirmDelete()}
                disabled={!canConfirmDelete}
              >
                {deletingBusy ? 'Deleting…' : 'Delete'}
              </AdminButton>
            )}
          </div>
        </div>
      </AdminModal>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[14px] border border-border bg-surface p-4">
      <span className="block text-[0.75rem] font-medium uppercase tracking-wider text-muted">
        {label}
      </span>
      <span className="mt-1 block text-[1.5rem] font-semibold text-navy">{value}</span>
    </div>
  );
}

/** Ask the image CDN for a small rendition — the stored URLs are 1600px wide. */
function thumbUrl(src: string): string {
  try {
    const url = new URL(src);
    if (url.hostname === 'images.unsplash.com') {
      url.searchParams.set('w', '96');
      url.searchParams.set('h', '96');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('q', '60');
      return url.toString();
    }
    if (url.hostname === 'res.cloudinary.com' && url.pathname.includes('/upload/')) {
      url.pathname = url.pathname.replace('/upload/', '/upload/c_fill,w_96,h_96,q_auto,f_auto/');
      return url.toString();
    }
  } catch {
    /* relative or unusual URL — use as-is */
  }
  return src;
}

function Thumb({ src }: { src: string | null }) {
  const [failed, setFailed] = React.useState(false);
  if (!src || failed) {
    return (
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-dashed border-border bg-bg text-muted/60"
        title={src ? 'Image could not be loaded' : 'No image'}
      >
        <ImageIcon size={16} aria-hidden="true" />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny admin thumbnail from arbitrary hosts
    <img
      src={thumbUrl(src)}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="h-10 w-10 shrink-0 rounded-[8px] border border-border bg-pearl object-cover"
    />
  );
}

function IconAction({
  label,
  onClick,
  href,
  disabled,
  tone = 'default',
  children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  tone?: 'default' | 'danger';
  children: React.ReactNode;
}) {
  const className = cn(
    'inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:pointer-events-none disabled:opacity-30',
    tone === 'danger' ? 'hover:bg-error/10 hover:text-error' : 'hover:bg-pearl hover:text-navy',
  );
  if (href) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        title={label}
        className={className}
      >
        {children}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={className}
    >
      {children}
    </button>
  );
}

function Disclosure({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-[12px] border border-border">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-[0.875rem] font-semibold text-navy">{title}</span>
          <span className="block text-[0.75rem] text-muted">{hint}</span>
        </span>
        <ChevronDown
          size={16}
          className="shrink-0 text-muted transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="border-t border-border px-4 pb-4 pt-1">{children}</div>
    </details>
  );
}
