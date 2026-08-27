import { expect, type Page } from '@playwright/test';

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'admin@rivet.com';
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'Admin123!';

/** Matches dashboard routes but not `/admin/login`. */
export const ADMIN_APP_URL = /\/admin(?:\/(?!login(?:\/|$))|$)/;

/** Sign in through the admin login screen and wait for the dashboard. */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/admin/login');
  await page.getByLabel('Email').fill(ADMIN_EMAIL);
  await page.getByLabel('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(ADMIN_APP_URL, { timeout: 15_000 });
  await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
}
