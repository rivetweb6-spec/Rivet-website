import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';

const analyze = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    loader: 'custom',
    loaderFile: './lib/cloudinary-loader.ts',
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  // Prefer static generation where possible; data revalidated via fetch + route segment.
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },
};

export default withSentryConfig(analyze(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Quiet build logs; source maps upload only when SENTRY_AUTH_TOKEN is present.
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Route browser Sentry calls through Next to bypass ad-blockers.
  tunnelRoute: '/monitoring',
});
