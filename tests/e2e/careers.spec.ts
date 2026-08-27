import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Careers', () => {
  test.describe.configure({ timeout: 60_000 });
  test('lists open vacancies and opens a role with requirements and apply', async ({ page }) => {
    await page.goto('/careers');
    await expect(page.getByRole('heading', { name: /join the work behind the landmarks/i })).toBeVisible();

    const empty = page.getByRole('heading', { name: /no open vacancies right now/i });
    if (await empty.isVisible().catch(() => false)) {
      await expect(page.getByRole('link', { name: /contact rivet/i })).toBeVisible();
      return;
    }

    const roleLink = page.locator('a[href^="/careers/"]').filter({ hasText: /view role and apply/i }).first();
    await expect(roleLink).toBeVisible();
    const href = await roleLink.getAttribute('href');
    expect(href).toMatch(/^\/careers\/.+/);
    await page.goto(href!);
    await expect(page.getByRole('heading', { name: /the role/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /requirements/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /submit your cv/i })).toBeVisible();
    await expect(page.getByText('Close', { exact: true }).first()).toBeVisible();
  });

  test('validates required application fields before submitting', async ({ page }) => {
    await page.goto('/careers');
    const empty = page.getByRole('heading', { name: /no open vacancies right now/i });
    if (await empty.isVisible().catch(() => false)) {
      test.skip(true, 'No open vacancies to apply to');
    }

    const applyLink = page.locator('a[href^="/careers/"]').filter({ hasText: /view role and apply/i }).first();
    await expect(applyLink).toBeVisible();
    const href = await applyLink.getAttribute('href');
    expect(href).toMatch(/^\/careers\/.+/);
    await page.goto(href!);
    await expect(page).toHaveURL(/\/careers\/[^/]+/);
    await expect(page.getByRole('heading', { name: /submit your cv/i })).toBeVisible();
    await expect(page.locator('form[data-ready="true"]')).toBeVisible();

    await page.getByRole('button', { name: /submit application/i }).click();
    await expect(page.getByText(/please share your name/i)).toBeVisible();
    await expect(page.getByText(/an email is required/i)).toBeVisible();
    await expect(page.getByText(/a phone number is required/i)).toBeVisible();
    await expect(page.getByText(/attach your cv as a pdf or word document/i)).toBeVisible();
  });
});

test.describe('Admin vacancies', () => {
  test('opens the vacancy editor from the management page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/vacancies');
    await expect(page.getByRole('heading', { name: 'Vacancies' })).toBeVisible();
    await page.getByRole('button', { name: /new vacancy/i }).click();
    await expect(page.getByRole('heading', { name: /new vacancy/i })).toBeVisible();
    await expect(page.getByLabel('Job title')).toBeVisible();
    await expect(page.getByLabel('Application deadline')).toBeVisible();
    await expect(page.getByText(/requirements \/ qualifications/i)).toBeVisible();
  });
});
