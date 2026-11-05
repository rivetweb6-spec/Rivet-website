# Deploying RIVET on the Yegara VPS

Server: Ubuntu 22.04, 2 vCPU, 4 GB RAM, 40 GB SSD, IP `159.69.33.224`.
Everything runs on this one server, with a **new, empty PostgreSQL database**.
No old (Render / Supabase) data is used.

```
rivetplc.com      ─▶ nginx ─▶ Next.js website  (127.0.0.1:3000)
api.rivetplc.com  ─▶ nginx ─▶ Express API      (127.0.0.1:4000) ─▶ PostgreSQL (local only)
www.rivetplc.com  ─▶ 301 redirect to https://rivetplc.com
Uploaded images   ─▶ /var/lib/rivet/uploads      Backups ─▶ /var/lib/rivet/backups
```

| File | Purpose |
|---|---|
| `deploy/setup-server.sh` | One-time server setup (root) |
| `deploy/harden-ssh.sh` | Key-only SSH (root, after keys work) |
| `deploy/deploy.sh` | First deploy and every update (`rivet` user) |
| `deploy/backup.sh` | Daily database + uploads backup (cron) |
| `deploy/ecosystem.config.cjs` | PM2 processes and memory limits |
| `deploy/nginx/rivetplc.conf` | nginx sites |

Commands marked **PC** run in PowerShell on your computer; **root** and **rivet**
run on the server as that user.

> **Never paste secrets into a shell command.** Edit `.env` files with `nano`,
> so passwords and keys do not end up in `~/.bash_history`.

---

## 1. DNS

In the panel where `rivetplc.com` is registered, create three **A records**:

| Name  | Type | Value           |
|-------|------|-----------------|
| `@`   | A    | `159.69.33.224` |
| `www` | A    | `159.69.33.224` |
| `api` | A    | `159.69.33.224` |

Check (**PC**): `nslookup rivetplc.com`, `nslookup www.rivetplc.com`,
`nslookup api.rivetplc.com` must all answer `159.69.33.224` before step 7.

## 2. Prepare the server

**PC**: copy the two root scripts to the server and log in:

```powershell
cd C:\Users\Abel\Desktop\Rivet_Website
scp deploy\setup-server.sh deploy\harden-ssh.sh root@159.69.33.224:/root/
ssh root@159.69.33.224
```

**root**:

```bash
bash /root/setup-server.sh
```

This installs Node.js 24, pnpm, PM2 (with log rotation), PostgreSQL, nginx,
certbot, fail2ban and the firewall (SSH, HTTP and HTTPS only), adds 2 GB swap and
creates the `rivet` user and an empty `rivet` database. The database connection
string is saved in `/root/rivet-db.txt`, readable by root only.

## 3. SSH keys and key-only login

**PC** (press Enter to accept the default file; a passphrase is recommended):

```powershell
ssh-keygen -t ed25519
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh root@159.69.33.224 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

**PC, a NEW window**: `ssh root@159.69.33.224` must log in **without asking for
the server password** (it may ask for your key passphrase). Only then, in the
server session:

**root**:

```bash
bash /root/harden-ssh.sh
```

Keep that session open and test one more new login from the PC. If anything goes
wrong, use the Yegara web console and run
`rm /etc/ssh/sshd_config.d/00-rivet-hardening.conf && systemctl reload ssh`.

## 4. Get the code

**root** → switch to the app user:

```bash
su - rivet
git clone https://github.com/rivetweb6-spec/Rivet-website.git /var/www/rivet
cd /var/www/rivet
```

If the repository is private, git asks for a username and password: use your
GitHub username and a **fine-grained personal access token** with read-only
access to this repository as the password.

## 5. Settings files

Get the values first (each prints once; copy into the files below):

```bash
# as root (type `exit` to leave the rivet user, `su - rivet` to return)
cat /root/rivet-db.txt              # DATABASE_URL line
# as rivet: two different JWT secrets
openssl rand -hex 48
openssl rand -hex 48
```

**rivet**: `nano /var/www/rivet/apps/api/.env` and enter:

```env
PORT=4000
NODE_ENV=production
TRUST_PROXY=2
CORS_ORIGIN=https://rivetplc.com
DATABASE_URL="postgresql://rivet:...@127.0.0.1:5432/rivet"
JWT_ACCESS_SECRET="<first openssl value>"
JWT_REFRESH_SECRET="<second openssl value>"
UPLOAD_DIR=/var/lib/rivet/uploads
PUBLIC_API_URL=https://api.rivetplc.com
SEED_ADMIN_EMAIL="<your real admin email>"
SEED_ADMIN_PASSWORD="<new strong password>"
```

The admin password must be **12+ characters** and must not contain common words
such as `admin123`, `password` or `rivet123`; otherwise the API refuses to create
the admin (and says why in `pm2 logs rivet-api`). It is used once — step 9
removes it from the file.

**rivet**: `nano /var/www/rivet/apps/web/.env.production` and enter:

```env
NEXT_PUBLIC_SITE_URL=https://rivetplc.com
NEXT_PUBLIC_API_URL=https://api.rivetplc.com/api
# Target of the website's /api proxy (browser → rivetplc.com/api → API).
# Server-rendered pages read NEXT_PUBLIC_API_URL, so HTTPS (step 6) must be
# working before the first build.
API_PROXY_TARGET=http://127.0.0.1:4000/api
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=""
```

Protect both files:

```bash
chmod 600 /var/www/rivet/apps/api/.env /var/www/rivet/apps/web/.env.production
```

## 6. nginx and HTTPS (before the first build)

Confirm all three names resolve to `159.69.33.224` (step 1). Then, **root**:

```bash
cp /var/www/rivet/deploy/nginx/rivetplc.conf /etc/nginx/sites-available/rivetplc
ln -sf /etc/nginx/sites-available/rivetplc /etc/nginx/sites-enabled/rivetplc
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
certbot --nginx -d rivetplc.com -d www.rivetplc.com -d api.rivetplc.com --redirect
```

Certbot asks for an email and agreement to its terms. The apps are not running
yet, so the sites show *502 Bad Gateway* until step 7 — that is expected.
Renewal is automatic (`systemctl list-timers | grep certbot`).

## 7. First deploy

**rivet**:

```bash
cd /var/www/rivet && bash deploy/deploy.sh
```

It installs dependencies, creates all database tables (Prisma migrations), starts
the API — which creates the admin from `SEED_ADMIN_*` — builds and starts the
website, and installs the daily backup job. It must end with `API OK`, `Web OK`
and `Deploy complete.`

## 8. Starting content (clean production seed)

**rivet**:

```bash
cd /var/www/rivet && pnpm db:seed:production
```

Creates only real company content: product categories and elevator
sub-categories, services, company text, homepage text, and the office address and
map location. It creates **no** demo products, team members, vacancies, news or
placeholder phone/email/social links, and never changes existing records, so it
is safe to re-run.

**Do not run `pnpm db:seed` on the server** — that is the development seed with
demo products and placeholders.

## 9. First login and password clean-up

1. Open https://rivetplc.com/admin and log in with `SEED_ADMIN_EMAIL` and
   `SEED_ADMIN_PASSWORD`.
2. **rivet**: remove the password from disk and restart the API:

   ```bash
   cd /var/www/rivet
   sed -i '/^SEED_ADMIN_PASSWORD=/d' apps/api/.env
   pm2 restart rivet-api
   ```

   (Admin creation only happens when the database has no users, so the setting
   is not needed again.)
3. In **Admin → Contact** add the real phone, email, WhatsApp and social links;
   in **Admin → Homepage** the management names, photos and messages; then add
   products in **Admin → Products**.

## 10. Check

- https://rivetplc.com — website
- https://www.rivetplc.com — redirects to https://rivetplc.com
- https://api.rivetplc.com/api/health — `{"status":"ok",...}`
- Admin: upload a test image, then open the image on the public page.
- **root**: `ufw status` (OpenSSH, Nginx Full only), `fail2ban-client status sshd`.

## 11. Backups

`deploy/backup.sh` runs every night at 02:30 and keeps 14 days of database dumps
and uploads archives in `/var/lib/rivet/backups` (log: `backup.log` there).

Run one now and check it (**rivet**):

```bash
bash /var/www/rivet/deploy/backup.sh && ls -lh /var/lib/rivet/backups
```

Copy backups to your PC regularly (**PC**):

```powershell
scp -r root@159.69.33.224:/var/lib/rivet/backups C:\Users\Abel\Desktop\rivet-backups
```

Restore commands are at the top of `deploy/backup.sh`.

---

## Updating the site

After changes are merged into `main` on GitHub (**PC** → **root** → **rivet**):

```bash
ssh root@159.69.33.224
su - rivet
cd /var/www/rivet && bash deploy/deploy.sh
```

Database migrations run automatically. During the web build (a few minutes) the
running site keeps serving; a short interruption is possible at the switch.

## Useful commands

| Task | Command |
|---|---|
| App status | `pm2 status` (rivet) |
| Logs | `pm2 logs rivet-api` / `pm2 logs rivet-web` (rivet) |
| Restart | `pm2 restart all` (rivet) |
| Memory | `free -h`, `pm2 monit` |
| Backup now | `bash /var/www/rivet/deploy/backup.sh` (rivet) |
| Banned IPs | `fail2ban-client status sshd` (root) |
| Reset DB password | `sudo -u postgres psql -c "ALTER USER rivet PASSWORD 'new-value'"` (root), then update `DATABASE_URL` in `apps/api/.env` and `/root/rivet-db.txt`, then `pm2 restart rivet-api` |
| Change admin password | Admin → Profile (requires the current password) |
