#!/usr/bin/env bash
# One-time setup for a fresh Ubuntu 22.04 / 24.04 VPS. Run as root:
#   bash setup-server.sh
# Installs Node.js 24, pnpm (via corepack), PM2 + log rotation, PostgreSQL,
# nginx, certbot, fail2ban and a firewall; creates the app user, folders and
# an empty database. Safe to re-run: existing users, database and swap are kept.
set -euo pipefail

APP_USER=rivet
APP_DIR=/var/www/rivet
DATA_DIR=/var/lib/rivet
UPLOAD_DIR=$DATA_DIR/uploads
BACKUP_DIR=$DATA_DIR/backups
DB_NAME=rivet
DB_USER=rivet
CRED_FILE=/root/rivet-db.txt

[[ $EUID -eq 0 ]] || { echo "Run as root."; exit 1; }
. /etc/os-release
[[ "$ID" == "ubuntu" ]] || { echo "This script expects Ubuntu (found: $PRETTY_NAME)"; exit 1; }

# Never stop for interactive prompts (Ubuntu 22.04 needrestart menu, config-file questions).
export DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=a
APT_OPTS=(-y -o Dpkg::Options::=--force-confdef -o Dpkg::Options::=--force-confold)

echo "==> System packages"
apt-get update
apt-get "${APT_OPTS[@]}" upgrade
apt-get "${APT_OPTS[@]}" install ca-certificates curl gnupg git ufw nginx \
  postgresql postgresql-contrib certbot python3-certbot-nginx fail2ban unattended-upgrades

echo "==> Node.js 24, pnpm, PM2"
if [[ "$(node -v 2>/dev/null || true)" != v24* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
  apt-get "${APT_OPTS[@]}" install nodejs
fi
corepack enable                       # provides pnpm (version pinned in package.json)
command -v pm2 >/dev/null || npm install -g pm2

echo "==> Swap (2 GB, helps next build)"
if [[ -z "$(swapon --show --noheadings)" && ! -f /swapfile ]]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
sysctl -q -w vm.swappiness=10
echo 'vm.swappiness=10' > /etc/sysctl.d/99-rivet.conf

echo "==> App user and folders"
id "$APP_USER" >/dev/null 2>&1 || adduser --disabled-password --gecos "" "$APP_USER"
mkdir -p "$APP_DIR" "$UPLOAD_DIR" "$BACKUP_DIR"
chown "$APP_USER:$APP_USER" "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$DATA_DIR"
chmod 750 "$DATA_DIR" "$BACKUP_DIR"

echo "==> PostgreSQL (new, empty database)"
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
  DB_PASS=$(openssl rand -hex 24)
  # Password goes in via stdin, not the command line (keeps it out of `ps`).
  sudo -u postgres psql -v ON_ERROR_STOP=1 -q <<SQL
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
SQL
  umask 077
  echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASS@127.0.0.1:5432/$DB_NAME\"" > "$CRED_FILE"
  umask 022
  unset DB_PASS
fi
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
  sudo -u postgres createdb -O "$DB_USER" "$DB_NAME"
fi

echo "==> Firewall: SSH + HTTP/HTTPS only"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> fail2ban (blocks repeated SSH login failures)"
cat > /etc/fail2ban/jail.d/rivet-sshd.local <<'EOF'
[sshd]
enabled = true
maxretry = 5
findtime = 10m
bantime = 1h
EOF
systemctl enable --now fail2ban
systemctl restart fail2ban

echo "==> Automatic security updates"
dpkg-reconfigure -f noninteractive unattended-upgrades

echo "==> nginx: hide version"
echo 'server_tokens off;' > /etc/nginx/conf.d/rivet-security.conf
nginx -t && systemctl reload nginx

echo "==> PM2 runs as $APP_USER and starts on boot, with log rotation"
env PATH="$PATH" pm2 startup systemd -u "$APP_USER" --hp "/home/$APP_USER"
sudo -u "$APP_USER" -H bash -lc '
  pm2 ping >/dev/null
  pm2 describe pm2-logrotate >/dev/null 2>&1 || pm2 install pm2-logrotate
  pm2 set pm2-logrotate:max_size 20M
  pm2 set pm2-logrotate:retain 10
  pm2 set pm2-logrotate:compress true
  pm2 save
' >/dev/null

echo
echo "Server ready."
if [[ -f "$CRED_FILE" ]]; then
  echo "The database connection string is saved in $CRED_FILE (readable by root only)."
  echo "Show it with:  cat $CRED_FILE"
fi
echo "Next: docs/Deployment-VPS.md, step 4 (get the code as $APP_USER)."
