#!/usr/bin/env bash
# Daily backup of the RIVET database and uploaded files. Runs as the app user
# from cron (installed by deploy.sh), or by hand:  bash deploy/backup.sh
# Keeps the last 14 days in /var/lib/rivet/backups. Also copy backups OFF the
# server regularly: a backup on the same disk does not survive a lost VPS.
#
# Restore the database:
#   pg_restore --clean --if-exists --no-owner -d "<DATABASE_URL>" db-YYYY-MM-DD-HHMM.dump
# Restore uploads:
#   tar -xzf uploads-YYYY-MM-DD-HHMM.tgz -C /var/lib/rivet
set -euo pipefail
cd "$(dirname "$0")/.."

BACKUP_DIR=${BACKUP_DIR:-/var/lib/rivet/backups}
UPLOAD_DIR=${UPLOAD_DIR:-/var/lib/rivet/uploads}
KEEP_DAYS=${KEEP_DAYS:-14}
STAMP=$(date +%F-%H%M)

DB_URL=$(grep -E '^DATABASE_URL=' apps/api/.env | head -n 1 | cut -d= -f2- | tr -d '"' | sed 's/[?&]schema=public//')
if [[ -z "$DB_URL" ]]; then
  echo "DATABASE_URL not found in apps/api/.env" >&2
  exit 1
fi

umask 077
mkdir -p "$BACKUP_DIR"

pg_dump --format=custom --no-owner --no-privileges --file="$BACKUP_DIR/db-$STAMP.dump" "$DB_URL"
tar -czf "$BACKUP_DIR/uploads-$STAMP.tgz" -C "$(dirname "$UPLOAD_DIR")" "$(basename "$UPLOAD_DIR")"

find "$BACKUP_DIR" -type f \( -name 'db-*.dump' -o -name 'uploads-*.tgz' \) -mtime +"$KEEP_DAYS" -delete
echo "$(date -Is) backup ok: db-$STAMP.dump, uploads-$STAMP.tgz"
