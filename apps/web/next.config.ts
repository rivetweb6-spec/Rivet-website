import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';

const analyze = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** Express API base including `/api` — used for same-origin browser proxy rewrites. */
const apiProxyTarget = (
  process.env.API_PROXY_TARGET ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4000/api'
).replace(/\/$/, '');

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
      { protocol: 'https', hostname: '*.onrender.com', pathname: '/api/uploads/**' },
      { protocol: 'https', hostname: '*.up.railway.app', pathname: '/api/uploads/**' },
    ],
  },
  // Prefer static generation where possible; data revalidated via fetch + route segment.
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },
  /**
   * Browser calls `/api/*` on the web origin; Next proxies to the Express API.
   * Use beforeFiles so the proxy wins before the App Router 404 on Vercel.
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
