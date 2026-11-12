import type { Category } from '@/lib/api';

/**
 * Category tree helpers, shared by server and client components. (Moved
 * unchanged out of components/products/category-group.tsx, a client module
 * whose exports can't be called from Server Components; it re-exports them.)
 */

export type CategoryTreeNode = Category & {
  children: CategoryTreeNode[];
};

/** Build a complete arbitrary-depth category tree from flat API list */
export function buildCategoryTree(allCategories: Category[]): CategoryTreeNode[] {
  const map = new Map<string, CategoryTreeNode>();
  for (const c of allCategories) {
    map.set(c.id, {
      ...c,
      children: [],
    });
  }

  const roots: CategoryTreeNode[] = [];
  for (const c of allCategories) {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: CategoryTreeNode[]) => {
    nodes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
    for (const node of nodes) {
      if (node.children.length > 0) {
        sortNodes(node.children);
      }
    }
  };

  sortNodes(roots);
  return roots;
}

/** Total published products in a category and all of its descendants. */
export function countSubtreeProducts(node: CategoryTreeNode): number {
  let total = node._count?.products ?? 0;
  for (const child of node.children) total += countSubtreeProducts(child);
  return total;
}
