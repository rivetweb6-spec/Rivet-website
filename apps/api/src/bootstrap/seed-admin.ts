/**
 * Credentials for the first admin account (created by `ensureAdminUser` on an
 * empty database, and by `pnpm db:seed`).
 *
 * Development and CI fall back to well-known defaults so local setup and the
 * E2E suite keep working. Production never does: those defaults are published
 * in the README, so an admin created with them is an open door.
 */
export const DEV_ADMIN_EMAIL = 'admin@rivet.com';
export const DEV_ADMIN_PASSWORD = 'Admin123!';

const MIN_PASSWORD_LENGTH = 12;

/** Passwords that appear in this repo, its docs, or every breach list. */
const KNOWN_WEAK = ['admin123!', 'admin123', 'password', 'changeme', 'rivet123', 'qwerty', '123456'];

export type SeedAdmin =
  | { ok: true; email: string; password: string }
  | { ok: false; problem: string };

export function resolveSeedAdmin(
  source: Record<string, string | undefined>,
  production: boolean,
): SeedAdmin {
  const email = source.SEED_ADMIN_EMAIL?.trim();
  const password = source.SEED_ADMIN_PASSWORD ?? '';

  if (!production) {
    return {
      ok: true,
      email: email || DEV_ADMIN_EMAIL,
      password: password || DEV_ADMIN_PASSWORD,
    };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, problem: 'SEED_ADMIN_EMAIL must be set to a valid email address.' };
  }
  if (!password) {
    return { ok: false, problem: 'SEED_ADMIN_PASSWORD must be set.' };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      problem: `SEED_ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }
  const lower = password.toLowerCase();
  if (KNOWN_WEAK.some((weak) => lower.includes(weak))) {
    return {
      ok: false,
      problem: 'SEED_ADMIN_PASSWORD is a known default or common password. Choose a unique one.',
    };
  }
  return { ok: true, email, password };
}
