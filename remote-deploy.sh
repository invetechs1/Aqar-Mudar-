#!/usr/bin/env bash
#
# Runs ON THE SERVER, inside the directory that holds aqar-mudar.tar and
# docker-compose.prod.yml (/root/aqar-mudr-web). Loads the new image, cuts
# the live app container over to it, and removes the image it replaces.
# Safe to re-run — never touches the Postgres data volume, and leaves an
# existing .env alone.
#
# Usage (on the server):
#   cd /root/aqar-mudr-web
#   bash remote-deploy.sh

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

COMPOSE_PROJECT="aqar-mudr-web"
COMPOSE_FILE="docker-compose.prod.yml"
IMAGE_REF="aqar-mudar:latest"
APP_PORT="8091"   # matches the port the shared nginx already proxies
                  # aqar-mudr.bassir.net to
DOMAIN="aqar-mudr.bassir.net"

if [ ! -f aqar-mudar.tar ]; then
  echo "ERROR: aqar-mudar.tar not found in $(pwd). scp it here first." >&2
  exit 1
fi
if [ ! -f "$COMPOSE_FILE" ]; then
  echo "ERROR: $COMPOSE_FILE not found in $(pwd). scp it here first." >&2
  exit 1
fi

# First deploy on this server: no .env yet, so create one with fresh secrets.
# Redeploy: .env already exists, leave it alone so nothing rotates under you.
if [ ! -f .env ]; then
  echo "==> No .env found — generating one with fresh secrets."
  cat > .env <<EOF
NEXTAUTH_URL=https://${DOMAIN}
NEXTAUTH_SECRET=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -hex 24)
APP_PORT=${APP_PORT}
EOF
else
  echo "==> Existing .env found — reusing it as-is."
fi

echo "==> Capturing the image this deploy will replace (if any)"
OLD_IMAGE_ID=$(docker images -q "$IMAGE_REF" || true)

echo "==> Loading the new image"
docker load -i aqar-mudar.tar

echo "==> Bringing up db (if not already running) and recreating app from the new image"
docker compose -p "$COMPOSE_PROJECT" -f "$COMPOSE_FILE" up -d --force-recreate app

echo "==> Waiting for the app to report healthy..."
ok=""
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -sf "http://localhost:${APP_PORT}/api/health" >/dev/null 2>&1; then
    ok="1"
    break
  fi
  sleep 3
done
if [ -n "$ok" ]; then
  echo "==> Healthy:"
  curl -s "http://localhost:${APP_PORT}/api/health"; echo
else
  echo "==> WARNING: health check did not pass after 30s — check 'docker compose -p $COMPOSE_PROJECT -f $COMPOSE_FILE logs app' before assuming this deploy is good."
fi

NEW_IMAGE_ID=$(docker images -q "$IMAGE_REF" || true)
if [ -n "$OLD_IMAGE_ID" ] && [ "$OLD_IMAGE_ID" != "$NEW_IMAGE_ID" ]; then
  echo "==> Removing the old image this deploy replaced ($OLD_IMAGE_ID)"
  docker rmi "$OLD_IMAGE_ID" 2>/dev/null || echo "    (still referenced somewhere, or already gone — skipping)"
else
  echo "==> No stale old image of this project to remove"
fi

echo "==> Current containers:"
docker compose -p "$COMPOSE_PROJECT" -f "$COMPOSE_FILE" ps

echo "==> Done. Verify: https://${DOMAIN}/api/health"
