/**
 * Clean production seed for a fresh database:  pnpm db:seed:production
 *
 * Creates only real RIVET COMPANY content (see seed-content.ts):
 *   categories + elevator sub-categories, services, company text,
 *   homepage text, office address and map location.
 *
 * It does NOT create demo products, team members, vacancies, news, or
 * placeholder phone / email / social links, and it never creates users —
 * the first admin is created by the API on start-up from SEED_ADMIN_*.
 *
 * Safe to re-run: existing records are left untouched (create-only), so
 * edits made in the admin dashboard are never overwritten.
 */
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import {
  categories,
  elevatorGroups,
  services,
  COMPANY_INFO,
  HOME_CONTENT,
  OFFICE_ADDRESS,
  OFFICE_COORDS,
} from './seed-content.js';

const prisma = new PrismaClient();

const created = { categories: 0, services: 0 };

async function main() {
  for (const c of categories) {
    const exists = await prisma.category.findUnique({ where: { slug: c.slug } });
    if (exists) continue;
    await prisma.category.create({ data: { ...c, images: [c.image] } });
    created.categories++;
  }

  const elevators = await prisma.category.findUnique({ where: { slug: 'elevators' } });
  if (elevators) {
    for (const group of elevatorGroups) {
      let parent = await prisma.category.findUnique({ where: { slug: group.slug } });
      if (!parent) {
        parent = await prisma.category.create({
          data: {
            name: group.name,
            slug: group.slug,
            parentId: elevators.id,
            order: group.order,
            description: group.description,
            image: group.image,
            images: [group.image],
          },
        });
        created.categories++;
      }
      for (const item of group.items) {
        const exists = await prisma.category.findUnique({ where: { slug: item.slug } });
        if (exists) continue;
        await prisma.category.create({
          data: {
            name: item.name,
            slug: item.slug,
            parentId: parent.id,
            order: item.order,
            description: item.description,
            image: item.image,
            images: item.image ? [item.image] : [],
          },
        });
        created.categories++;
      }
    }
  }

  for (const s of services) {
    const exists = await prisma.service.findUnique({ where: { slug: s.slug } });
    if (exists) continue;
    await prisma.service.create({ data: s });
    created.services++;
  }

  const singletons = [
    () =>
      prisma.companyInfo.upsert({
        where: { id: 'company' },
        update: {},
        create: { id: 'company', ...COMPANY_INFO },
      }),
    // Only confirmed details: phone, email and social links are added in Admin → Contact.
    () =>
      prisma.contactInfo.upsert({
        where: { id: 'contact' },
        update: {},
        create: {
          id: 'contact',
          address: OFFICE_ADDRESS,
          mapLat: OFFICE_COORDS.lat,
          mapLng: OFFICE_COORDS.lng,
        },
      }),
    // Management names, photos and messages are added in Admin → Homepage.
    () =>
      prisma.homePageContent.upsert({
        where: { id: 'home' },
        update: {},
        create: { id: 'home', ...HOME_CONTENT },
      }),
  ];
  for (const run of singletons) {
    await run();
  }

  console.log(
    `Production seed complete: ${created.categories} categories and ${created.services} services created ` +
      '(existing records left unchanged). No products, team, vacancies or users were created.',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
