import { PrismaClient } from '@prisma/client';

const local = new PrismaClient({
  datasources: { db: { url: 'postgresql://postgres:4040@localhost:5432/rivet?schema=public' } },
});

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
