import { readFileSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';

const POOLER =
  'postgresql://postgres.fxrjmhcinojpwbrvoikg:%28Superbase%2907@aws-1-eu-west-2.pooler.supabase.com:5432/postgres?sslmode=require';

const remote = new PrismaClient({ datasources: { db: { url: POOLER } } });
const backupPath = new URL('../prisma/local-data-backup.json', import.meta.url);
const data = JSON.parse(readFileSync(backupPath, 'utf8'));

console.log('Importing from backup into Supabase…');

await remote.$connect();

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

if (data.users.length) await remote.user.createMany({ data: data.users });
if (data.categories.length) await remote.category.createMany({ data: data.categories });
if (data.products.length) await remote.product.createMany({ data: data.products });
if (data.productImages.length) await remote.productImage.createMany({ data: data.productImages });
if (data.services.length) await remote.service.createMany({ data: data.services });
if (data.newsArticles.length) await remote.newsArticle.createMany({ data: data.newsArticles });
if (data.demoRequests.length) await remote.demoRequest.createMany({ data: data.demoRequests });
if (data.contactMessages.length) await remote.contactMessage.createMany({ data: data.contactMessages });
if (data.companyInfo.length) await remote.companyInfo.createMany({ data: data.companyInfo });
if (data.contactInfo.length) await remote.contactInfo.createMany({ data: data.contactInfo });
if (data.homePageContent.length) await remote.homePageContent.createMany({ data: data.homePageContent });

const counts = {
  users: await remote.user.count(),
  categories: await remote.category.count(),
  products: await remote.product.count(),
  productImages: await remote.productImage.count(),
  services: await remote.service.count(),
  news: await remote.newsArticle.count(),
  homePageContent: await remote.homePageContent.count(),
};

console.log('Supabase after import:', counts);
await remote.$disconnect();
