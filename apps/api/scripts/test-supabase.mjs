import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const remote = new PrismaClient();

try {
  await remote.$connect();
  console.log('Supabase connected. Users:', await remote.user.count());
} catch (e) {
  console.error('Supabase error:', e.message);
} finally {
  await remote.$disconnect();
}
