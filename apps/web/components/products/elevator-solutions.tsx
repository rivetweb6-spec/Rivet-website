'use client';

import * as React from 'react';
import type { Category } from '@/lib/api';
import { CategoryHierarchySection } from './category-group';

export function ElevatorSolutions({
  category,
  eyebrow,
  title,
  description,
}: {
  category?: Category;
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  if (!category) return null;
  return (
    <CategoryHierarchySection
      category={category}
      eyebrow={eyebrow}
      title={title}
      description={description}
    />
  );
}
