#!/usr/bin/env bash
# Turn off SSH password logins (key-only) and block password-based root login.
# Run as root ONLY after confirming that SSH key login works (docs/Deployment-VPS.md, step 3):
#   bash /var/www/rivet/deploy/harden-ssh.sh
# Refuses to run if root has no authorized SSH key, so you cannot lock yourself out,
# and reverts automatically if the new sshd config does not validate.
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "Run as root."; exit 1; }

KEYS=/root/.ssh/authorized_keys
if [[ ! -s "$KEYS" ]] || ! grep -qE '^(ssh-(ed25519|rsa)|ecdsa-sha2-|sk-)' "$KEYS"; then
  echo "No SSH key found in $KEYS. Add your key first (step 3). Nothing was changed."
  exit 1
fi

# sshd keeps the FIRST value it reads for each setting. "00-" sorts before the
# provider's 50-cloud-init.conf, which often sets "PasswordAuthentication yes".
CONF=/etc/ssh/sshd_config.d/00-rivet-hardening.conf
printf '%s\n' \
  'PasswordAuthentication no' \
  'KbdInteractiveAuthentication no' \
  'PermitRootLogin prohibit-password' \
  'PubkeyAuthentication yes' \
  'MaxAuthTries 4' \
  'LoginGraceTime 30' \
  'X11Forwarding no' > "$CONF"
chmod 644 "$CONF"

if ! sshd -t; then
  rm -f "$CONF"
  echo "sshd config test failed. Change reverted; nothing applied."
  exit 1
fi
systemctl reload ssh

echo "SSH is now key-only."
echo "KEEP THIS SESSION OPEN and test a new login from another window before closing it."
echo "To undo:  rm $CONF && systemctl reload ssh"
