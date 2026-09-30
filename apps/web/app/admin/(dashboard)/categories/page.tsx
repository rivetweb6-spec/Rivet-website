'use client';

import * as React from 'react';
import {
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  FolderTree,
  ImageIcon,
  Plus,
  Search,
  Tag,
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

type CategoryForm = {
  name: string;
  slug: string;
  parentId: string;
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

export type CategoryTreeNode = Category & {
  childrenNodes: CategoryTreeNode[];
  level: number;
  path: string;
  totalProducts: number;
};

function getDescendantIds(all: Category[], rootId: string): Set<string> {
  const descendants = new Set<string>();
  const queue = [rootId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const c of all) {
      if (c.parentId === current && !descendants.has(c.id)) {
        descendants.add(c.id);
        queue.push(c.id);
      }
    }
  }
  return descendants;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [search, setSearch] = React.useState('');
  const [collapsedIds, setCollapsedIds] = React.useState<Set<string>>(new Set());
  const [form, setForm] = React.useState<CategoryForm>({
    name: '',
    slug: '',
    parentId: '',
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

  const load = React.useCallback(async () => {
    const r = await adminApi.categories.list();
    setCategories(r.categories);
  }, []);

  React.useEffect(() => {
    load().catch((e: Error) => setError(e.message));
  }, [load]);

  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreate = (presetParentId?: string) => {
    setEditingId(null);
    setForm({
      name: '',
      slug: '',
      parentId: presetParentId ?? '',
      description: '',
      image: '',
      order: categories.length + 1,
      faqsText: '',
      ...emptySeoFields(),
    });
    setError(null);
    setOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      slug: c.slug,
      parentId: c.parentId ?? '',
      description: c.description ?? '',
      image: c.image ?? '',
      order: c.order,
      faqsText: faqsToText(c.faqs),
      ...pickSeoFields(c),
    });
    setError(null);
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const faqs = textToFaqs(form.faqsText);
      const payload: Partial<Category> & { name: string } = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        parentId: form.parentId.trim() ? form.parentId.trim() : null,
        description: form.description.trim() || undefined,
        image: form.image || null,
        order: Number(form.order) || 0,
        faqs: faqs.length ? faqs : null,
        ...seoPayload(pickSeoFields(form)),
      };

      if (editingId) {
        await adminApi.categories.update(editingId, payload);
      } else {
        await adminApi.categories.create(payload);
      }

      await revalidatePublicCache('categories');
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  // Build recursive multi-level tree with full ancestral paths
  const { treeRoots, allFlatNodes, orphanNodes } = React.useMemo(() => {
    const nodeMap = new Map<
      string,
      CategoryTreeNode
    >();

    for (const c of categories) {
      nodeMap.set(c.id, {
        ...c,
        childrenNodes: [],
        level: 0,
        path: c.name,
        totalProducts: productCountOf(c),
      });
    }

    const roots: CategoryTreeNode[] = [];
    const orphans: CategoryTreeNode[] = [];

    for (const c of categories) {
      const node = nodeMap.get(c.id)!;
      if (c.parentId) {
        const parentNode = nodeMap.get(c.parentId);
        if (parentNode) {
          parentNode.childrenNodes.push(node);
        } else {
          orphans.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    // Set levels, paths, and total products recursively
    function setupNode(node: CategoryTreeNode, currentLevel: number, parentPath: string): number {
      node.level = currentLevel;
      node.path = parentPath ? `${parentPath} → ${node.name}` : node.name;

      // Sort children
      node.childrenNodes.sort(
        (a, b) => a.order - b.order || a.name.localeCompare(b.name),
      );

      let subTotal = productCountOf(node);
      for (const child of node.childrenNodes) {
        subTotal += setupNode(child, currentLevel + 1, node.path);
      }
      node.totalProducts = subTotal;
      return subTotal;
    }

    roots.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
    for (const root of roots) {
      setupNode(root, 0, '');
    }

    orphans.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
    for (const orphan of orphans) {
      setupNode(orphan, 1, 'Unassigned');
    }

    // Flat list of all nodes with full paths for the parent select dropdown
    const flat: { id: string; name: string; path: string; level: number }[] = [];
    function collectFlat(nodes: CategoryTreeNode[]) {
      for (const n of nodes) {
        flat.push({ id: n.id, name: n.name, path: n.path, level: n.level });
        collectFlat(n.childrenNodes);
      }
    }
    collectFlat(roots);

    return { treeRoots: roots, allFlatNodes: flat, orphanNodes: orphans };
  }, [categories]);

  // Eligible parent options in modal: all categories except self and any of self's descendants
  const invalidParentIds = React.useMemo(() => {
    if (!editingId) return new Set<string>();
    return new Set<string>([
      editingId,
      ...Array.from(getDescendantIds(categories, editingId)),
    ]);
  }, [categories, editingId]);

  const eligibleParentOptions = React.useMemo(() => {
    return allFlatNodes.filter((n) => !invalidParentIds.has(n.id));
  }, [allFlatNodes, invalidParentIds]);

  // Flatten tree for table rendering while respecting collapsed state and search
  const visibleRows = React.useMemo(() => {
    const rows: CategoryTreeNode[] = [];
    const q = search.trim().toLowerCase();

    function traverse(nodes: CategoryTreeNode[], matchesParent: boolean) {
      for (const node of nodes) {
        const matchesSelf =
          !q ||
          node.name.toLowerCase().includes(q) ||
          node.slug.toLowerCase().includes(q);

        // Check if any descendant matches
        let hasMatchingDescendant = false;
        if (q) {
          const descQueue = [...node.childrenNodes];
          while (descQueue.length > 0) {
            const cur = descQueue.shift()!;
            if (
              cur.name.toLowerCase().includes(q) ||
              cur.slug.toLowerCase().includes(q)
            ) {
              hasMatchingDescendant = true;
              break;
            }
            descQueue.push(...cur.childrenNodes);
          }
        }

        const shouldInclude =
          !q || matchesSelf || matchesParent || hasMatchingDescendant;

        if (shouldInclude) {
          rows.push(node);
          // If searching or not collapsed, traverse children
          const isCollapsed = collapsedIds.has(node.id);
          if ((!isCollapsed || q) && node.childrenNodes.length > 0) {
            traverse(node.childrenNodes, matchesSelf || matchesParent);
          }
        }
      }
    }

    traverse(treeRoots, false);
    if (orphanNodes.length > 0) {
      traverse(orphanNodes, false);
    }

    return rows;
  }, [treeRoots, orphanNodes, collapsedIds, search]);

  // Delete modal state
  const deletingChildren = React.useMemo(() => {
    if (!deleting) return [];
    return categories.filter((c) => c.parentId === deleting.id);
  }, [categories, deleting]);

  const deletingProductCount = deleting ? productCountOf(deleting) : 0;
  const otherCategories = React.useMemo(() => {
    if (!deleting) return [];
    return categories.filter((c) => c.id !== deleting.id);
  }, [categories, deleting]);

  const hasSubcategoryBlocker = deletingChildren.length > 0;
  const canConfirmDelete =
    !!deleting &&
    !deletingBusy &&
    !hasSubcategoryBlocker &&
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

  return (
    <div>
      <AdminPageHeader
        title="Categories & Subcategories"
        description="Organize your product catalog into hierarchical departments, groups, and subcategories."
        actions={
          <AdminButton onClick={() => openCreate()}>
            <Plus size={16} className="mr-1.5" />
            Add category
          </AdminButton>
        }
      />

      {error && (
        <div className="mb-4 rounded-[10px] border border-error/20 bg-error/10 p-3 text-[0.875rem] text-error">
          {error}
        </div>
      )}

      {/* Quick Search & Summary */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search departments, groups, or subcategories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[10px] border border-divider bg-surface py-2 pl-9 pr-3 text-[0.875rem] text-ink placeholder:text-muted/70 focus:border-gold focus:outline-none"
          />
        </div>
        <div className="text-[0.8125rem] text-muted">
          {treeRoots.length} parent {treeRoots.length === 1 ? 'department' : 'departments'},{' '}
          {categories.length - treeRoots.length} subcategories ({categories.length} total)
        </div>
      </div>

      <AdminCard className="overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-left text-[0.875rem]">
          <thead className="border-b border-divider bg-bg/80 text-[0.75rem] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Hierarchy / Name</th>
              <th className="px-5 py-3 font-medium">Slug</th>
              <th className="px-5 py-3 font-medium">Products</th>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EmptyState message="No categories yet. Click 'Add category' to create your first parent category." />
                </td>
              </tr>
            )}

            {categories.length > 0 && visibleRows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">
                  No categories matching “{search}”.
                </td>
              </tr>
            )}

            {visibleRows.map((node) => {
              const hasChildren = node.childrenNodes.length > 0;
              const isCollapsed = collapsedIds.has(node.id);
              const directProducts = productCountOf(node);
              const totalProducts = node.totalProducts;

              // Row indentation styling based on level
              const isLevel0 = node.level === 0;
              const isLevel1 = node.level === 1;

              return (
                <tr
                  key={node.id}
                  className={`border-b border-divider/60 transition-colors ${
                    isLevel0
                      ? 'bg-pearl/50 hover:bg-pearl/80 font-medium'
                      : isLevel1
                        ? 'bg-pearl/15 hover:bg-pearl/30'
                        : 'hover:bg-pearl/10'
                  }`}
                >
                  {/* Category Name Column with Tree Indentation */}
                  <td className="py-3 pr-4" style={{ paddingLeft: `${Math.max(1.25, node.level * 2.25 + 1.25)}rem` }}>
                    <div className="flex items-center gap-2">
                      {/* Collapse / Expand Toggle or Branch Icon */}
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() => toggleCollapse(node.id)}
                          className="flex h-5 w-5 items-center justify-center rounded text-muted hover:bg-black/5 hover:text-navy"
                          title={isCollapsed ? 'Expand subcategories' : 'Collapse subcategories'}
                        >
                          {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                        </button>
                      ) : node.level > 0 ? (
                        <CornerDownRight size={14} className="text-muted/60 flex-shrink-0" />
                      ) : (
                        <span className="w-5" />
                      )}

                      {/* Icon */}
                      {isLevel0 ? (
                        <FolderTree size={16} className="text-gold flex-shrink-0" />
                      ) : (
                        <Tag size={13} className="text-muted/80 flex-shrink-0" />
                      )}

                      {/* Image Thumbnail if present */}
                      {node.image && (
                        <span
                          className="h-5 w-5 rounded overflow-hidden flex-shrink-0 border border-border/80 bg-surface inline-block"
                          title="Image attached"
                        >
                          <img
                            src={node.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </span>
                      )}

                      {/* Name */}
                      <span
                        className={`${
                          isLevel0
                            ? 'font-semibold text-navy text-[0.9375rem]'
                            : isLevel1
                              ? 'font-medium text-navy text-[0.875rem]'
                              : 'text-ink text-[0.875rem]'
                        }`}
                      >
                        {node.name}
                      </span>

                      {/* Level badges */}
                      {isLevel0 && hasChildren && (
                        <span className="ml-1 inline-flex items-center rounded-full bg-gold/15 px-2 py-0.5 text-[0.6875rem] font-medium text-navy">
                          {node.childrenNodes.length}{' '}
                          {node.childrenNodes.length === 1 ? 'sub-group' : 'sub-groups'}
                        </span>
                      )}

                      {isLevel1 && hasChildren && (
                        <span className="ml-1 inline-flex items-center rounded-full bg-navy/10 px-2 py-0.5 text-[0.6875rem] font-medium text-navy">
                          {node.childrenNodes.length}{' '}
                          {node.childrenNodes.length === 1 ? 'item' : 'items'}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="px-4 py-3 font-mono text-[0.8125rem] text-muted">
                    {node.slug}
                  </td>

                  {/* Products */}
                  <td className="px-4 py-3 text-muted">
                    {hasChildren && totalProducts !== directProducts ? (
                      <span>
                        <span className="font-medium text-ink">{totalProducts}</span>
                        <span className="text-[0.75rem] text-muted ml-1">
                          ({directProducts} direct)
                        </span>
                      </span>
                    ) : (
                      <span>{productLabel(directProducts)}</span>
                    )}
                  </td>

                  {/* Order */}
                  <td className="px-4 py-3 text-muted">{node.order}</td>

                  {/* Actions */}
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    {/* Add child button */}
                    <button
                      type="button"
                      className="mr-3 inline-flex items-center text-[0.8125rem] font-medium text-gold hover:text-navy transition-colors"
                      onClick={() => openCreate(node.id)}
                      title={`Add child under ${node.name}`}
                    >
                      <Plus size={13} className="mr-0.5" />
                      {isLevel0 ? 'Add subcategory' : 'Add item'}
                    </button>

                    {/* Edit button */}
                    <button
                      type="button"
                      className="mr-3 text-[0.8125rem] font-medium text-navy hover:text-gold transition-colors"
                      onClick={() => openEdit(node)}
                    >
                      Edit
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      className="text-[0.8125rem] font-medium text-error hover:underline transition-colors"
                      onClick={() => openDelete(node)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </AdminCard>

      {/* Add / Edit Category Modal */}
      <AdminModal open={open} onClose={() => setOpen(false)} className="max-w-2xl">
        <form onSubmit={save} className="space-y-4">
          <h2 className="text-[1.25rem] font-semibold text-navy">
            {editingId ? 'Edit category / subcategory' : 'New category / subcategory'}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              label="Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Standard Passenger Elevators"
            />
            <AdminInput
              label="Slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="Auto-generated if left empty"
            />
          </div>

          <AdminSelect
            label="Parent category"
            value={form.parentId}
            onChange={(e) => setForm({ ...form, parentId: e.target.value })}
          >
            <option value="">None (Top-level Department)</option>
            {eligibleParentOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.level === 0 ? p.name : `${'— '.repeat(p.level)}${p.path}`}
              </option>
            ))}
          </AdminSelect>

          <AdminTextarea
            label="Description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Detailed description shown on the public solutions and category pages..."
          />

          <ImageUploadField
            label="Category image"
            value={form.image}
            onChange={(image) => setForm({ ...form, image })}
            onError={setError}
          />

          <AdminInput
            label="Display order"
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
          />

          <AdminTextarea
            label="FAQs (question on first line, answer below; blank line between items)"
            rows={5}
            value={form.faqsText}
            onChange={(e) => setForm({ ...form, faqsText: e.target.value })}
            placeholder="Do you supply passenger elevators?&#10;Yes, we supply premium elevators..."
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

          <div className="flex justify-end gap-3 pt-3">
            <AdminButton type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit">Save category</AdminButton>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminModal
        open={!!deleting}
        onClose={closeDelete}
        className="max-w-md"
        labelledBy="delete-category-title"
      >
        <div className="space-y-4">
          <h2 id="delete-category-title" className="text-[1.25rem] font-semibold text-navy">
            Delete category
          </h2>

          {deleteError && <p className="text-[0.875rem] text-error">{deleteError}</p>}

          {/* Subcategory Blocker */}
          {hasSubcategoryBlocker && (
            <div className="rounded-[10px] border border-error/30 bg-error/10 p-3.5 text-[0.875rem] text-ink">
              <p className="font-semibold text-error mb-1">Cannot delete category with subcategories</p>
              <p>
                <span className="font-medium text-ink">{deleting?.name}</span> currently has{' '}
                <span className="font-medium">{deletingChildren.length}</span> subcategor
                {deletingChildren.length === 1 ? 'y' : 'ies'}:{' '}
                <span className="font-medium text-navy">
                  {deletingChildren.map((c) => c.name).join(', ')}
                </span>
                .
              </p>
              <p className="mt-2 text-muted text-[0.8125rem]">
                You must delete or reassign all subcategories before deleting this category.
              </p>
            </div>
          )}

          {/* Product Reassignment Requirement */}
          {!hasSubcategoryBlocker && deleting && deletingProductCount > 0 && (
            <>
              <p className="rounded-[10px] border border-warning/30 bg-warning/10 p-3 text-[0.875rem] text-ink">
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
                      {c.name} {c.parentId ? '(Subcategory)' : ''}
                    </option>
                  ))}
                </AdminSelect>
              )}
            </>
          )}

          {/* Standard Confirmation */}
          {!hasSubcategoryBlocker && deleting && deletingProductCount === 0 && (
            <p className="text-[0.9375rem] text-muted">
              Delete <span className="font-medium text-ink">{deleting.name}</span>? This cannot be
              undone.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
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
