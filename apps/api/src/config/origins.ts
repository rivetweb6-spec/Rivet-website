/**
 * Allowed browser origins for CORS and for cookie-authenticated writes.
 *
 * Only exact origins are accepted (scheme + host + optional port). Wildcards
 * are rejected on purpose: a pattern such as `*.vercel.app` — or even a
 * narrower `rivet-*.vercel.app` — matches sites anyone can deploy, and with
 * credentialed CORS that lets a stranger's page act as a logged-in admin.
 * List each preview URL explicitly if one needs direct API access.
 */
export function parseAllowedOrigins(raw: string): Set<string> {
  const origins = new Set<string>();
  for (const entry of raw.split(',').map((s) => s.trim()).filter(Boolean)) {
    if (entry.includes('*')) {
      throw new Error(
        `CORS_ORIGIN entry "${entry}" contains a wildcard. List exact origins only, e.g. https://rivet.example.com`,
      );
    }
    let url: URL;
    try {
      url = new URL(entry);
    } catch {
      throw new Error(`CORS_ORIGIN entry "${entry}" is not a valid URL.`);
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new Error(`CORS_ORIGIN entry "${entry}" must start with http:// or https://.`);
    }
    if (url.pathname !== '/' || url.search || url.hash) {
      throw new Error(
        `CORS_ORIGIN entry "${entry}" must be an origin only (no path), e.g. ${url.origin}`,
      );
    }
    origins.add(url.origin);
  }
  return origins;
}

/** True when `origin` (an Origin header value) exactly matches an allowed origin. */
export function isAllowedOrigin(allowed: Set<string>, origin: string | undefined): boolean {
  if (!origin) return false;
  try {
    return allowed.has(new URL(origin).origin);
  } catch {
    return false;
  }
}
