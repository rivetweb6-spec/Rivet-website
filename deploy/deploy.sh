#!/usr/bin/env bash
# Build and (re)start RIVET on the VPS. Run as the app user from the repo root:
#   bash deploy/deploy.sh
# Order: pull -> install -> migrate DB -> start API -> build web (with the API
# up, so pages are pre-rendered with real data) -> start web -> checks -> backup cron.
set -euo pipefail
cd "$(dirname "$0")/.."
REPO=$(pwd)

# corepack downloads the pnpm version pinned in package.json without asking.
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

[[ -f apps/api/.env ]] || { echo "Missing apps/api/.env (docs/Deployment-VPS.md, step 5)"; exit 1; }
[[ -f apps/web/.env.production ]] || { echo "Missing apps/web/.env.production (step 5)"; exit 1; }

# wait_for <url> <label> <pm2 app>
wait_for() {
  for _ in $(seq 1 30); do
    if curl -fsS -o /dev/null "$1"; then
      echo "$2 OK"
      return 0
    fi
    sleep 2
  done
  echo "$2 check FAILED. See: pm2 logs $3 --lines 50"
  return 1
}

echo "==> Update code"
git pull --ff-only origin main

echo "==> Install dependencies"
pnpm install --frozen-lockfile --prod=false

echo "==> API: build + database migrations"
pnpm db:generate
pnpm --filter @rivet/api build
pnpm --filter @rivet/api prisma:deploy

echo "==> API: start / reload"
pm2 startOrReload deploy/ecosystem.config.cjs --only rivet-api --update-env
wait_for http://127.0.0.1:4000/api/health "API" rivet-api

echo "==> Web: build"
pnpm --filter @rivet/web build

echo "==> Web: start / reload"
pm2 startOrReload deploy/ecosystem.config.cjs --only rivet-web --update-env
pm2 save >/dev/null
wait_for http://127.0.0.1:3000/ "Web" rivet-web

echo "==> Daily backup at 02:30 (crontab of $(whoami))"
CRON_LINE="30 2 * * * bash $REPO/deploy/backup.sh >> /var/lib/rivet/backups/backup.log 2>&1"
{ crontab -l 2>/dev/null | grep -v 'deploy/backup.sh' || true; echo "$CRON_LINE"; } | crontab -

echo "Deploy complete."
