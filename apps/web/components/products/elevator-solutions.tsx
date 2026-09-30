'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { RivetImage } from '@/components/ui/rivet-image';
import { Stagger, StaggerItem } from '@/components/motion/reveal';
import {
  elevatorSubCategories,
  type ElevatorSubCategory,
} from '@/lib/data/content';
import { assets } from '@/lib/assets';
import type { Category } from '@/lib/api';

/* Fallback images mapped by slug keyword */
const FALLBACK_ITEM_IMAGES: Record<string, string> = {
  'standard-passenger': assets.elevatorSolutions.standardPassenger,
  'premium-passenger': assets.elevatorSolutions.premiumPassenger,
  panoramic: assets.elevatorSolutions.panoramic,
  'office-building': assets.elevatorSolutions.officeBuilding,
  hotel: assets.elevatorSolutions.hotel,
  'shopping-mall': assets.elevatorSolutions.shoppingMall,
  service: assets.elevatorSolutions.service,
  freight: assets.elevatorSolutions.freight,
  'heavy-duty': assets.elevatorSolutions.heavyDuty,
};

function fallbackImageFor(slug: string, fallbackDepartment: string): string {
  for (const [key, url] of Object.entries(FALLBACK_ITEM_IMAGES)) {
    if (slug.includes(key)) return url;
  }
  return fallbackDepartment || assets.categories.elevators;
}

/* Group the flat fallback list by `group` while preserving insertion order. */
function staticGrouped(): [string, ElevatorSubCategory[]][] {
  const map = new Map<string, ElevatorSubCategory[]>();
  for (const item of elevatorSubCategories) {
    let list = map.get(item.group);
    if (!list) {
      list = [];
      map.set(item.group, list);
    }
    list.push(item);
  }
  return [...map.entries()];
}

export function ElevatorSolutions({
  category,
  eyebrow = 'Elevator Solutions',
  title = 'Explore our elevator range',
  description = 'From residential passenger lifts to industrial freight systems, Rivet supplies and installs a complete range of elevator solutions for every project scale in Ethiopia.',
}: {
  category?: Category;
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  // Dynamically resolve groups and items from database Category hierarchy if available
  const groups = React.useMemo(() => {
    if (!category?.children?.length) {
      return staticGrouped();
    }

    // Look for sub-groups that contain child subcategories
    const subGroups = category.children.filter(
      (c) => Array.isArray(c.children) && c.children.length > 0,
    );

    if (subGroups.length === 0) {
      return staticGrouped();
    }

    // Sort groups by order then name
    const sortedGroups = [...subGroups].sort(
      (a, b) => a.order - b.order || a.name.localeCompare(b.name),
    );

    return sortedGroups.map((group) => {
      const sortedItems = [...(group.children ?? [])].sort(
        (a, b) => a.order - b.order || a.name.localeCompare(b.name),
      );

      const items: ElevatorSubCategory[] = sortedItems.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description:
          item.description ||
          `Premium ${item.name.toLowerCase()} supplied and installed by Rivet for projects in Ethiopia.`,
        image:
          item.image ||
          fallbackImageFor(item.slug, category.image || assets.categories.elevators),
        group: group.name,
      }));

      return [group.name, items] as [string, ElevatorSubCategory[]];
    });
  }, [category]);

  return (
    <Section className="bg-surface">
      <Container>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-3 text-[2rem] sm:text-[2.5rem]">
          {title}
        </h2>
        <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-muted">
          {description}
        </p>

        {/* Gold divider */}
        <div className="gold-rule mt-10" aria-hidden="true" />

        <div className="mt-14 space-y-20">
          {groups.map(([groupName, items]) => (
            <div key={groupName}>
              <h3 className="text-[1.5rem] sm:text-[1.75rem]">{groupName}</h3>

              <Stagger className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <StaggerItem key={item.id}>
                    <div
                      className="luxury-card group flex h-full flex-col overflow-hidden rounded-[16px] bg-canvas shadow-[var(--shadow-sm)]"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <RivetImage
                          src={item.image}
                          alt={`${item.name} — premium elevator solutions by Rivet`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Gradient overlay for text legibility */}
                        <div
                          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent"
                          aria-hidden="true"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col p-6">
                        <span className="eyebrow text-gold-muted">
                          {groupName}
                        </span>
                        <h4 className="headline-display mt-2 text-[1.25rem]">
                          {item.name}
                        </h4>
                        <p className="mt-2 flex-1 text-[0.875rem] leading-relaxed text-muted">
                          {item.description}
                        </p>
                        <Link
                          href="/request-quotation"
                          className="mt-5 inline-flex items-center gap-2 text-[0.875rem] font-semibold text-gold transition-colors hover:text-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                        >
                          Request a quotation
                          <ArrowRight
                            size={15}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                            aria-hidden="true"
                          />
                        </Link>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
