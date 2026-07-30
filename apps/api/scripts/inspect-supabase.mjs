import { PrismaClient } from '@prisma/client';

const url =
  'postgresql://postgres.fxrjmhcinojpwbrvoikg:%28Superbase%2907@aws-1-eu-west-2.pooler.supabase.com:5432/postgres?sslmode=require';
const p = new PrismaClient({ datasources: { db: { url } } });

try {
  const counts = {
    users: await p.user.count(),
    categories: await p.category.count(),
    products: await p.product.count(),
    productImages: await p.productImage.count(),
    services: await p.service.count(),
    news: await p.newsArticle.count(),
    demoRequests: await p.demoRequest.count(),
    contactMessages: await p.contactMessage.count(),
    companyInfo: await p.companyInfo.count(),
    contactInfo: await p.contactInfo.count(),
    homePageContent: await p.homePageContent.count(),
  };
  console.log('Supabase counts:', counts);
} finally {
  await p.$disconnect();
}
