#!/bin/bash
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run this script as root on the VPS."
  exit 1
fi

APP_DIR=/opt/uruschat
REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

if ! command -v node >/dev/null 2>&1 || ! node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 22 ? 0 : 1)'; then
  apt-get update
  apt-get install -y ca-certificates curl gnupg
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

apt-get install -y nginx

mkdir -p "$APP_DIR"
rsync -a --delete \
  --exclude node_modules \
  --exclude server/node_modules \
  --exclude server/data \
  --exclude server/uploads \
  --exclude server/.env \
  --exclude .env \
  --exclude .git \
  "$REPO_DIR/" "$APP_DIR/"

cd "$APP_DIR"
npm install
npm run build
npm install --prefix server

cp "$APP_DIR/server/deploy/uruschat.nginx" /etc/nginx/sites-available/uruschat
ln -sfn /etc/nginx/sites-available/uruschat /etc/nginx/sites-enabled/uruschat
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/zombie-shooter.online
nginx -t
systemctl reload nginx

cp "$APP_DIR/server/deploy/uruschat.service" /etc/systemd/system/uruschat.service
systemctl daemon-reload
systemctl enable uruschat
systemctl restart uruschat

echo "API is on http://282692.fornex.cloud"
echo "For HTTPS, run: certbot --nginx -d 282692.fornex.cloud"
