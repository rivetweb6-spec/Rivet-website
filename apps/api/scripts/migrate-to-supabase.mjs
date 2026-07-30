/**
 * One-off: export all app data from local PostgreSQL and import into Supabase.
 * Usage (from repo root): node apps/api/scripts/migrate-to-supabase.mjs
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const LOCAL_URL =
  process.env.LOCAL_DATABASE_URL ??
  'postgresql://postgres:4040@localhost:5432/rivet?schema=public';

const REMOTE_URL =
  process.env.DATABASE_URL ??
  'postgresql://postgres.fxrjmhcinojpwbrvoikg:%28Superbase%2907@aws-1-eu-west-2.pooler.supabase.com:5432/postgres?sslmode=require';

const local = new PrismaClient({ datasources: { db: { url: LOCAL_URL } } });
const remote = new PrismaClient({ datasources: { db: { url: REMOTE_URL } } });

async function countRows(client, label) {
  const counts = {
    users: await client.user.count(),
    categories: await client.category.count(),
    products: await client.product.count(),
    productImages: await client.productImage.count(),
    services: await client.service.count(),
    news: await client.newsArticle.count(),
    demoRequests: await client.demoRequest.count(),
    contactMessages: await client.contactMessage.count(),
    companyInfo: await client.companyInfo.count(),
    contactInfo: await client.contactInfo.count(),
    homePageContent: await client.homePageContent.count(),
  };
  console.log(label, counts);
  return counts;
}

async function main() {
  console.log('Connecting to local DB…');
  await local.$connect();
  console.log('Connecting to Supabase…');
  await remote.$connect();

  const localCounts = await countRows(local, 'Local:');
  const totalLocal = Object.values(localCounts).reduce((a, b) => a + b, 0);
  if (totalLocal === 0) {
    console.warn('Local database appears empty — nothing to migrate.');
  }

  console.log('\nClearing remote data (respecting FK order)…');
  await remote.$transaction([
    remote.productImage.deleteMany(),
    remote.product.deleteMany(),
    remote.category.deleteMany(),
    remote.service.deleteMany(),
    remote.newsArticle.deleteMany(),
    remote.demoRequest.deleteMany(),
    remote.contactMessage.deleteMany(),
    remote.user.deleteMany(),
    remote.companyInfo.deleteMany(),
    remote.contactInfo.deleteMany(),
    remote.homePageContent.deleteMany(),
  ]);

  console.log('Copying data…');

  const users = await local.user.findMany();
  if (users.length) await remote.user.createMany({ data: users });

  const categories = await local.category.findMany();
  if (categories.length) await remote.category.createMany({ data: categories });

  const products = await local.product.findMany();
  if (products.length) await remote.product.createMany({ data: products });

  const productImages = await local.productImage.findMany();
  if (productImages.length) await remote.productImage.createMany({ data: productImages });

  const services = await local.service.findMany();
  if (services.length) await remote.service.createMany({ data: services });

  const news = await local.newsArticle.findMany();
  if (news.length) await remote.newsArticle.createMany({ data: news });

  const demoRequests = await local.demoRequest.findMany();
  if (demoRequests.length) await remote.demoRequest.createMany({ data: demoRequests });

  const contactMessages = await local.contactMessage.findMany();
  if (contactMessages.length) await remote.contactMessage.createMany({ data: contactMessages });

  const companyInfo = await local.companyInfo.findMany();
  if (companyInfo.length) await remote.companyInfo.createMany({ data: companyInfo });

  const contactInfo = await local.contactInfo.findMany();
  if (contactInfo.length) await remote.contactInfo.createMany({ data: contactInfo });

  const homePageContent = await local.homePageContent.findMany();
  if (homePageContent.length) await remote.homePageContent.createMany({ data: homePageContent });

  console.log('\nMigration complete.');
  await countRows(remote, 'Supabase:');
}

main()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await local.$disconnect();
    await remote.$disconnect();
  });
