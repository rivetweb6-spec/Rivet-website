import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'coverage/**',
      'playwright-report/**',
    ],
  },
  ...nextCoreWebVitals,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      // react-hooks v7 (bundled with Next 16) flags intentional prop-sync and
      // data-loading effects. Keep it visible as a warning rather than blocking.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
];

export default config;
