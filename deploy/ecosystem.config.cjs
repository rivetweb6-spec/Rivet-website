/**
 * PM2 process file for the RIVET VPS (see docs/Deployment-VPS.md).
 *   pm2 startOrReload deploy/ecosystem.config.cjs --update-env
 * Paths are absolute (resolved from this file), so PM2 works from any folder.
 * Env vars come from apps/api/.env and apps/web/.env.production.
 * Memory limits suit a 4 GB VPS: PostgreSQL + API + web, with headroom for builds.
 */
const path = require('node:path');

const root = path.resolve(__dirname, '..');

module.exports = {
  apps: [
    {
      name: 'rivet-api',
      cwd: path.join(root, 'apps/api'),
      script: 'dist/server.js',
      node_args: '--enable-source-maps --max-old-space-size=384',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '450M',
      kill_timeout: 5000,
      time: true,
    },
    {
      name: 'rivet-web',
      cwd: path.join(root, 'apps/web'),
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 127.0.0.1 -p 3000',
      node_args: '--max-old-space-size=768',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '1G',
      kill_timeout: 5000,
      time: true,
    },
  ],
};
