#!/usr/bin/env node
/**
 * RIVET post-deploy smoke tests (P7-6).
 *
 * Verifies the deployed API and web app respond correctly. Run after each
 * production/preview deploy.
 *
 * Usage:
 *   API_URL=https://rivet-api.onrender.com/api \
 *   SITE_URL=https://rivet.vercel.app \
 *   node scripts/smoke-test.mjs
 *
 * Or pass as flags:
 *   node scripts/smoke-test.mjs --api https://... --site https://...
 */

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 ? args[i + 1] : undefined;
};

const API_URL = (flag('api') ?? process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');
const SITE_URL = (flag('site') ?? process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS ?? 15000);

const results = [];

async function check(name, url, validate) {
  const started = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' });
    clearTimeout(timer);
    const ms = Date.now() - started;
    await validate(res);
    results.push({ name, url, ok: true, status: res.status, ms });
    console.log(`  PASS  ${name} (${res.status}, ${ms}ms) → ${url}`);
  } catch (err) {
    const ms = Date.now() - started;
    results.push({ name, url, ok: false, error: String(err), ms });
    console.error(`  FAIL  ${name} (${ms}ms) → ${url}\n        ${err}`);
  }
}

function expectStatus(res, expected = 200) {
  if (res.status !== expected) throw new Error(`expected ${expected}, got ${res.status}`);
}

async function main() {
  console.log('RIVET smoke tests');
  console.log(`  API_URL  = ${API_URL || '(unset)'}`);
  console.log(`  SITE_URL = ${SITE_URL || '(unset)'}\n`);

  if (!API_URL && !SITE_URL) {
    console.error('Nothing to test: set API_URL and/or SITE_URL.');
    process.exit(2);
  }

  if (API_URL) {
    await check('API health', `${API_URL}/health`, async (res) => {
      expectStatus(res, 200);
      const body = await res.json();
      if (body.status !== 'ok') throw new Error(`health status = ${body.status}`);
    });
    await check('API categories', `${API_URL}/categories`, (res) => expectStatus(res, 200));
    await check('API products', `${API_URL}/products`, (res) => expectStatus(res, 200));
  }

  if (SITE_URL) {
    await check('Web homepage', `${SITE_URL}/`, (res) => expectStatus(res, 200));
    await check('Web robots.txt', `${SITE_URL}/robots.txt`, (res) => expectStatus(res, 200));
    await check('Web sitemap.xml', `${SITE_URL}/sitemap.xml`, (res) => expectStatus(res, 200));
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
