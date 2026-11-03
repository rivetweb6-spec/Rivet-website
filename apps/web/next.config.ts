import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';

const analyze = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const LOCAL_API_URL = 'http://localhost:4000/api';

/** Express API base including `/api` — used for same-origin browser proxy rewrites. */
const rawTarget =
  process.env.API_PROXY_TARGET?.trim() ||
  process.env.NEXT_PUBLIC_API_URL?.trim();

if (!rawTarget && process.env.NODE_ENV === 'production') {
  console.warn(
    '\n[rivet] NEXT_PUBLIC_API_URL is not set — this build will proxy /api to ' +
      `${LOCAL_API_URL}. Set NEXT_PUBLIC_API_URL to the deployed API (including /api) ` +
      'before building for production.\n',
  );
}

const apiProxyTarget = (rawTarget || LOCAL_API_URL).replace(/\/$/, '');

/** Images uploaded to the API are served from its own host at /api/uploads/files/*. */
function apiUploadsPattern(): NonNullable<NonNullable<NextConfig['images']>['remotePatterns']>[number] | null {
  try {
    const url = new URL(apiProxyTarget);
    if (url.hostname === 'localhost') return null; // covered by the explicit localhost entry
    return {
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: '/api/uploads/**',
    };
  } catch {
    return null;
  }
}

/** Baseline security headers for every response (host-independent). */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const uploadsPattern = apiUploadsPattern();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The default bottom-left badge sits on top of the admin "Sign out" control.
  devIndicators: false,
  images: {
    loader: 'custom',
    loaderFile: './lib/cloudinary-loader.ts',
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/api/uploads/**' },
      ...(uploadsPattern ? [uploadsPattern] : []),
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  // Prefer static generation where possible; data revalidated via fetch + route segment.
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },
  /**
   * Browser calls `/api/*` on the web origin; Next proxies to the Express API.
   * Use beforeFiles so the proxy wins before the App Router's 404 handling.
   */
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${apiProxyTarget}/:path*`,
        },
      ],
    };
  },
};

const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

export default withSentryConfig(analyze(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: sentryAuthToken,
  // Quiet when not uploading; CI still logs if a token is configured.
  silent: !sentryAuthToken || !process.env.CI,
  // Skip release/source-map upload unless a token is set (avoids Vercel noise).
  sourcemaps: {
    disable: !sentryAuthToken,
  },
  release: {
    create: Boolean(sentryAuthToken),
  },
  widenClientFileUpload: true,
  // Route browser Sentry calls through Next to bypass ad-blockers.
  tunnelRoute: '/monitoring',
});
