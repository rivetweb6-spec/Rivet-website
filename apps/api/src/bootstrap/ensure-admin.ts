import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { isProd } from '../config/env.js';
import { resolveSeedAdmin } from './seed-admin.js';

/**
 * First-deploy safety net: if the User table is empty, create the seed admin
 * so `/admin/login` works without a manual `pnpm db:seed` on the host.
 *
 * In production the credentials must come from SEED_ADMIN_EMAIL /
 * SEED_ADMIN_PASSWORD and the password must be strong. If they are not, no
 * admin is created — the public site keeps running, and the log explains what
 * to set before restarting.
 */
export async function ensureAdminUser() {
  const count = await prisma.user.count();
  if (count > 0) return;

  const admin = resolveSeedAdmin(process.env, isProd);
  if (!admin.ok) {
    console.error(
      [
        '',
        '='.repeat(78),
        ' NO ADMIN ACCOUNT CREATED — the database has no users yet.',
        '='.repeat(78),
        ` ${admin.problem}`,
        '',
        ' Set SEED_ADMIN_EMAIL and a strong SEED_ADMIN_PASSWORD (12+ characters,',
        ' not a default) in the host environment, then restart the API.',
        '='.repeat(78),
        '',
      ].join('\n'),
    );
    return;
  }

  const passwordHash = await bcrypt.hash(admin.password, 12);
  await prisma.user.create({
    data: {
      name: 'RIVET Admin',
      email: admin.email,
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log(
    isProd
      ? `Created admin user (${admin.email}) from SEED_ADMIN_* settings.`
      : `Created default admin user (${admin.email}). Change this password after first login.`,
  );
}
