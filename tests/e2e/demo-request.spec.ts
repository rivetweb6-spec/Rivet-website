import { test, expect } from '@playwright/test';

test.describe('Request a Private Demo', () => {
  test('validates required fields before submitting', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Request Demo' }).first().click();

    const dialog = page.getByRole('dialog', { name: /request a private demo/i });
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: /request demo/i }).click();

    await expect(dialog.getByText(/please share your name/i)).toBeVisible();
    await expect(dialog.getByText(/an email is required/i)).toBeVisible();
    await expect(dialog.getByText(/a phone number is required/i)).toBeVisible();
  });

  test('flags a malformed email address', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Request Demo' }).first().click();
    const dialog = page.getByRole('dialog', { name: /request a private demo/i });

    await dialog.getByLabel(/email address/i).fill('not-an-email');
    await dialog.getByLabel(/email address/i).blur();
    await expect(dialog.getByText(/email looks incomplete/i)).toBeVisible();
  });

  test('submits a complete request and shows the success moment', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Request Demo' }).first().click();
    const dialog = page.getByRole('dialog', { name: /request a private demo/i });

    await dialog.getByLabel('Full Name').fill('Playwright Tester');
    await dialog.getByLabel(/email address/i).fill('playwright@example.com');
    await dialog.getByLabel(/phone number/i).fill('+251900000000');
    await dialog.getByLabel(/product interest/i).selectOption({ index: 1 });

    await dialog.getByRole('button', { name: /request demo/i }).click();

    await expect(page.getByText(/request received/i)).toBeVisible({ timeout: 15_000 });
  });
});
