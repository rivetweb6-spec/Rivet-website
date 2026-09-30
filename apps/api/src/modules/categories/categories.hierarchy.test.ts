import { describe, it, expect } from 'vitest';

describe('Category hierarchy validation logic', () => {
  type MockCategory = { id: string; name: string; parentId: string | null };

  function assertNoCircular(
    categoryId: string,
    candidateParentId: string,
    categories: MockCategory[],
  ): void {
    if (categoryId === candidateParentId) {
      throw new Error('A category cannot be its own parent.');
    }
    let currentId: string | null = candidateParentId;
    const visited = new Set<string>([categoryId]);
    while (currentId) {
      if (visited.has(currentId)) {
        throw new Error('Circular parent category relationship is not allowed.');
      }
      visited.add(currentId);
      const parent = categories.find((c) => c.id === currentId);
      if (!parent) {
        throw new Error('Parent category not found.');
      }
      currentId = parent.parentId;
    }
  }

  it('allows a valid parent-child relationship', () => {
    const cats: MockCategory[] = [
      { id: '1', name: 'Elevators', parentId: null },
      { id: '2', name: 'Passenger Lifts', parentId: null },
    ];
    expect(() => assertNoCircular('2', '1', cats)).not.toThrow();
  });

  it('prevents a category from being its own parent', () => {
    const cats: MockCategory[] = [{ id: '1', name: 'Elevators', parentId: null }];
    expect(() => assertNoCircular('1', '1', cats)).toThrow('A category cannot be its own parent.');
  });

  it('prevents direct circular reference (A -> B -> A)', () => {
    const cats: MockCategory[] = [
      { id: '1', name: 'Elevators', parentId: null },
      { id: '2', name: 'Passenger Lifts', parentId: '1' },
    ];
    // Trying to make Elevators child of Passenger Lifts:
    expect(() => assertNoCircular('1', '2', cats)).toThrow('Circular parent category relationship is not allowed.');
  });

  it('prevents indirect circular reference (A -> B -> C -> A)', () => {
    const cats: MockCategory[] = [
      { id: '1', name: 'Elevators', parentId: null },
      { id: '2', name: 'Passenger Lifts', parentId: '1' },
      { id: '3', name: 'Premium Passenger Lifts', parentId: '2' },
    ];
    // Trying to make Elevators child of Premium Passenger Lifts:
    expect(() => assertNoCircular('1', '3', cats)).toThrow('Circular parent category relationship is not allowed.');
  });

  it('throws when parent does not exist', () => {
    const cats: MockCategory[] = [{ id: '1', name: 'Elevators', parentId: null }];
    expect(() => assertNoCircular('1', 'non-existent', cats)).toThrow('Parent category not found.');
  });
});
