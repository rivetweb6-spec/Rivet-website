const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

function isLoopback(hostname: string): boolean {
  return LOOPBACK_HOSTS.has(hostname.toLowerCase());
}

/**
 * API base for code running in the browser.
 *
 * Uses the configured public API URL when there is one — except when that URL
 * points at `localhost` while the page itself was opened from another address
 * (e.g. a phone on the same Wi-Fi visiting http://192.168.x.x:3000). There,
 * "localhost" would mean the phone, so the same-origin `/api` proxy from
 * next.config is used instead.
 */
export function browserApiBase(configured: string | undefined, pageHostname?: string): string {
  if (!configured) return '/api';
  const host = pageHostname ?? (typeof window !== 'undefined' ? window.location.hostname : '');
  try {
    const target = new URL(configured);
    if (isLoopback(target.hostname) && host && !isLoopback(host)) return '/api';
  } catch {
    // Relative or malformed — let the caller's value through unchanged.
  }
  return configured;
}
