import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';

/**
 * First-deploy safety net: if the User table is empty, create the seed admin
 * so `/admin/login` works without a manual `pnpm db:seed` on the host.
 */
export async function ensureAdminUser() {
  const count = await prisma.user.count();
  if (count > 0) return;

  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@rivet.com';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name: 'RIVET Admin',
      email,
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log(`Created default admin user (${email}). Change this password after first login.`);
}
