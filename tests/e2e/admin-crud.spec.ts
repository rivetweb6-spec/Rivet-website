import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Admin CRUD — Categories', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('creates and then deletes a category', async ({ page }) => {
    const name = `E2E Category ${Date.now()}`;

    await page.goto('/admin/categories');
    await expect(page.getByRole('heading', { name: 'Categories' })).toBeVisible();

    await page.getByRole('button', { name: /add category/i }).click();
    await page.getByLabel('Name').fill(name);
    await page.getByRole('button', { name: /^save$/i }).click();

    const row = page.getByRole('row', { name: new RegExp(name) });
    await expect(row).toBeVisible({ timeout: 15_000 });

    page.once('dialog', (dialog) => dialog.accept());
    await row.getByRole('button', { name: /delete/i }).click();

    await expect(page.getByRole('row', { name: new RegExp(name) })).toHaveCount(0, {
      timeout: 15_000,
    });
  });
});
