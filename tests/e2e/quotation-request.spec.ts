import { test, expect } from '@playwright/test';

test.describe('Request a Quotation', () => {
  test('validates required fields before submitting', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Request a Quotation' }).first().click();

    const dialog = page.getByRole('dialog', { name: /request a quotation/i });
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: /submit quotation request/i }).click();

    await expect(dialog.getByText(/please share your name/i)).toBeVisible();
    await expect(dialog.getByText(/an email is required/i)).toBeVisible();
    await expect(dialog.getByText(/a phone number is required/i)).toBeVisible();
    await expect(dialog.getByText(/which product you need/i)).toBeVisible();
    await expect(dialog.getByText(/quantity you need/i)).toBeVisible();
  });

  test('flags a malformed email address', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Request a Quotation' }).first().click();
    const dialog = page.getByRole('dialog', { name: /request a quotation/i });

    await dialog.getByLabel(/email address/i).fill('not-an-email');
    await dialog.getByLabel(/email address/i).blur();
    await expect(dialog.getByText(/email looks incomplete/i)).toBeVisible();
  });

  test('submits a complete request and shows the success moment', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Request a Quotation' }).first().click();
    const dialog = page.getByRole('dialog', { name: /request a quotation/i });

    await dialog.getByLabel('Full Name').fill('Playwright Tester');
    await dialog.getByLabel(/email address/i).fill('playwright@example.com');
    await dialog.getByLabel(/phone number/i).fill('+251900000000');
    await dialog.getByLabel(/product name/i).fill('Passenger Elevator');
    await dialog.getByLabel(/requested quantity/i).fill('2 units');
    await dialog.getByLabel(/product category/i).selectOption({ index: 1 });

    await dialog.getByRole('button', { name: /submit quotation request/i }).click();

    await expect(page.getByText(/request received/i)).toBeVisible({ timeout: 15_000 });
  });

  test('prefills product details from a product page', async ({ page }) => {
    await page.goto('/products');
    const firstCard = page.locator('a[href^="/products/"]').first();
    await firstCard.click();

    await page.getByRole('button', { name: 'Request a Quotation' }).first().click();
    const dialog = page.getByRole('dialog', { name: /request a quotation/i });
    await expect(dialog).toBeVisible();

    // Product is preselected — the manual product-name field is replaced by a summary card.
    await expect(dialog.getByLabel(/product name/i)).toHaveCount(0);
    await expect(dialog.getByLabel(/requested quantity/i)).toBeVisible();
  });
});
