#!/usr/bin/env bash
# One-command update: pull the latest code from GitHub and restart the site.
# Run this on the VPS from inside the project folder:  bash update.sh
set -e
cd "$(dirname "$0")"
echo "→ Pulling latest from GitHub..."
git pull
echo "→ Installing any new dependencies..."
npm install --omit=dev
echo "→ Restarting the site..."
sudo systemctl restart u2berstudio
echo "✓ Done. Live at https://studio.u2berclub.com"
