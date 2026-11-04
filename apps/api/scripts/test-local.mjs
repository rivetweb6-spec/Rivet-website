/**
 * Connectivity check for a local database.
 * Usage: LOCAL_DATABASE_URL=postgresql://... node apps/api/scripts/test-local.mjs
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const url = process.env.LOCAL_DATABASE_URL ?? process.env.DATABASE_URL;
if (!url) {
  console.error('Set LOCAL_DATABASE_URL (or DATABASE_URL) to the database to check.');
  process.exit(1);
}

const local = new PrismaClient({ datasources: { db: { url } } });

try {
  await local.$connect();
  const counts = {
    users: await local.user.count(),
    categories: await local.category.count(),
    products: await local.product.count(),
    home: await local.homePageContent.count(),
  };
  console.log('Local DB OK:', counts);
} catch (e) {
  console.error('Local DB error:', e.message);
} finally {
  await local.$disconnect();
}
