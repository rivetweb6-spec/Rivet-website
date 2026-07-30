import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'node:fs';

const local = new PrismaClient({
  datasources: { db: { url: 'postgresql://postgres:4040@localhost:5432/rivet?schema=public' } },
});

const data = {
  users: await local.user.findMany(),
  categories: await local.category.findMany(),
  products: await local.product.findMany(),
  productImages: await local.productImage.findMany(),
  services: await local.service.findMany(),
  newsArticles: await local.newsArticle.findMany(),
  demoRequests: await local.demoRequest.findMany(),
  contactMessages: await local.contactMessage.findMany(),
  companyInfo: await local.companyInfo.findMany(),
  contactInfo: await local.contactInfo.findMany(),
  homePageContent: await local.homePageContent.findMany(),
};

const out = new URL('../prisma/local-data-backup.json', import.meta.url);
writeFileSync(out, JSON.stringify(data, null, 2));
console.log('Exported to', out.pathname);
for (const [k, v] of Object.entries(data)) console.log(`  ${k}: ${v.length}`);

await local.$disconnect();
