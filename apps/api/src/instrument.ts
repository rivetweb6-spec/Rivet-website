/**
 * Sentry instrumentation (P7-7).
 *
 * Imported as the very first module in `server.ts` so Sentry can auto-instrument
 * HTTP and Express before they are loaded. A no-op when SENTRY_DSN is unset.
 */
import * as Sentry from '@sentry/node';
import { env } from './config/env.js';

export const sentryEnabled = Boolean(env.SENTRY_DSN);

if (sentryEnabled) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT ?? env.NODE_ENV,
    tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE,
    sendDefaultPii: false,
  });
}
