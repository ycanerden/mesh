#!/bin/bash
# Mesh — Deploy to Railway
# Usage from walkie-talkie/: ./scripts/deploy.sh
# Note: git auto-deploy is unreliable; use this script instead

set -e
cd "$(dirname "$0")/.."

echo ""
echo "  Mesh Deploy"
echo "  ─────────────────────────"

if ! command -v railway &>/dev/null; then
  echo "  Need Railway CLI: npm install -g @railway/cli && railway login"
  exit 1
fi

# Quick build check
echo "  Building..."
bun build src/index.ts --target=bun --outdir=dist 2>&1 | grep -E "Bundled|error" | head -3

echo "  Uploading to Railway..."
railway deployment up --service p2p --yes 2>&1 | grep -v "^$"

echo "  Waiting for deployment..."
sleep 25

for i in $(seq 1 10); do
  LATEST=$(railway deployment list --service p2p 2>/dev/null | grep -m1 "| SUCCESS\|| FAILED\|| DEPLOYING" || echo "waiting")
  echo "  [$i] $LATEST"
  echo "$LATEST" | grep -q "SUCCESS" && break
  echo "$LATEST" | grep -q "FAILED" && echo "  FAILED — check Railway dashboard" && exit 1
  sleep 10
done

echo ""
VER=$(curl -s "https://p2p-production-983f.up.railway.app/health" 2>/dev/null | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('version','?'))" 2>/dev/null || echo "?")
echo "  Live: v$VER  https://p2p-production-983f.up.railway.app"
echo ""
