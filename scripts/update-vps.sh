#!/bin/bash
# ==============================================================================
# JanSeva 1-Click Update Script for VPS
# Pulls latest code, rebuilds frontend, and reloads PM2 backend
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "==> Pulling latest git updates..."
git pull origin $(git rev-parse --abbrev-ref HEAD)

echo "==> Updating backend dependencies..."
cd "$PROJECT_ROOT/backend"
npm install --omit=dev

echo "==> Rebuilding frontend..."
cd "$PROJECT_ROOT/frontend"
npm install
npm run build
sudo cp -r "$PROJECT_ROOT/frontend/dist/"* /var/www/janseva/

echo "==> Reloading backend process..."
cd "$PROJECT_ROOT"
pm2 reload janseva-backend

echo "=========================================================="
echo "  Update successful! Everything is running smoothly."
echo "=========================================================="
