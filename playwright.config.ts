import { defineConfig, devices } from '@playwright/test';

/**
 * RIVET end-to-end tests (P7-2).
 *
 * Flows covered: public demo-request, admin authentication, admin CRUD.
 *
 * These specs exercise the full stack, so they expect a running web app on
 * `E2E_BASE_URL` (default http://localhost:3000) backed by the Express API and a
 * seeded database. When `E2E_BASE_URL` is not set, Playwright boots the monorepo
 * dev servers via `pnpm dev` for you.
 *
 * Seed admin credentials (see prisma/seed.ts):
 *   E2E_ADMIN_EMAIL    (default admin@rivet.com)
 *   E2E_ADMIN_PASSWORD (default Admin123!)
 */
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const useExternalServer = Boolean(process.env.E2E_BASE_URL);

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  ...(useExternalServer
    ? {}
    : {
        webServer: {
          command: 'pnpm dev',
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          stdout: 'pipe',
          stderr: 'pipe',
        },
      }),
});
