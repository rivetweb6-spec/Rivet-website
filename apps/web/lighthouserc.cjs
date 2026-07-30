/**
 * Lighthouse CI — Performance / Accessibility / Best-Practices / SEO ≥ 90
 *
 * Run locally after `pnpm --filter @rivet/web build && pnpm --filter @rivet/web start`:
 *   pnpm --filter @rivet/web lhci
 *
 * Or via root: `pnpm lighthouse`
 */

module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/products',
        'http://localhost:3000/services',
        'http://localhost:3000/company',
        'http://localhost:3000/news',
        'http://localhost:3000/contact',
      ],
      numberOfRuns: 3,
      startServerCommand: 'pnpm --filter @rivet/web start',
      startServerReadyPattern: 'Ready|started server',
      startServerReadyTimeout: 120000,
      settings: {
        preset: 'desktop',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
