import { describe, expect, it } from 'vitest';
import { DEV_ADMIN_EMAIL, DEV_ADMIN_PASSWORD, resolveSeedAdmin } from './seed-admin.js';

const strong = 'Kq7#tLm2!vRx9pWz';

describe('resolveSeedAdmin — development / CI', () => {
  it('falls back to the documented defaults', () => {
    expect(resolveSeedAdmin({}, false)).toEqual({
      ok: true,
      email: DEV_ADMIN_EMAIL,
      password: DEV_ADMIN_PASSWORD,
    });
  });

  it('uses provided values when present', () => {
    expect(
      resolveSeedAdmin({ SEED_ADMIN_EMAIL: 'me@example.com', SEED_ADMIN_PASSWORD: 'x' }, false),
    ).toEqual({ ok: true, email: 'me@example.com', password: 'x' });
  });
});

describe('resolveSeedAdmin — production', () => {
  it('refuses when nothing is configured (no silent default admin)', () => {
    const r = resolveSeedAdmin({}, true);
    expect(r.ok).toBe(false);
  });

  it('refuses the published default password', () => {
    const r = resolveSeedAdmin(
      { SEED_ADMIN_EMAIL: 'admin@rivet.com', SEED_ADMIN_PASSWORD: 'Admin123!' },
      true,
    );
    expect(r).toEqual(expect.objectContaining({ ok: false }));
  });

  it('refuses short passwords', () => {
    const r = resolveSeedAdmin({ SEED_ADMIN_EMAIL: 'ops@rivet.com', SEED_ADMIN_PASSWORD: 'Xy7#short' }, true);
    expect(r.ok === false && r.problem).toMatch(/at least 12/);
  });

  it('refuses long passwords built around a known default', () => {
    const r = resolveSeedAdmin(
      { SEED_ADMIN_EMAIL: 'ops@rivet.com', SEED_ADMIN_PASSWORD: 'Admin123!Admin123!' },
      true,
    );
    expect(r.ok === false && r.problem).toMatch(/known default/);
  });

  it('refuses a missing or invalid email', () => {
    expect(resolveSeedAdmin({ SEED_ADMIN_PASSWORD: strong }, true).ok).toBe(false);
    expect(
      resolveSeedAdmin({ SEED_ADMIN_EMAIL: 'not-an-email', SEED_ADMIN_PASSWORD: strong }, true).ok,
    ).toBe(false);
  });

  it('accepts an explicit email and strong password', () => {
    expect(
      resolveSeedAdmin({ SEED_ADMIN_EMAIL: ' ops@rivet.com ', SEED_ADMIN_PASSWORD: strong }, true),
    ).toEqual({ ok: true, email: 'ops@rivet.com', password: strong });
  });
});
