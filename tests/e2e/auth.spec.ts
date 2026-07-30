import { test, expect } from '@playwright/test';
import { ADMIN_EMAIL, ADMIN_PASSWORD, loginAsAdmin } from './helpers';

test.describe('Admin authentication', () => {
  test('renders the login form', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('rejects invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel('Email').fill('wrong@rivet.com');
    await page.getByLabel('Password').fill('definitely-wrong');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid|failed|incorrect|unauthorized/i)).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('signs in with seeded admin credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel('Email').fill(ADMIN_EMAIL);
    await page.getByLabel('Password').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/admin(\/|$)/, { timeout: 15_000 });
  });

  test('protects the dashboard from anonymous access', async ({ page }) => {
    await page.goto('/admin/categories');
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 15_000 });
  });

  test('logs out back to the login screen', async ({ page }) => {
    await loginAsAdmin(page);
    const logout = page.getByRole('button', { name: /log ?out|sign ?out/i });
    if (await logout.count()) {
      await logout.first().click();
      await expect(page).toHaveURL(/\/admin\/login/, { timeout: 15_000 });
    }
  });
});
