#!/usr/bin/env bash
#
# Full redeploy: build the image locally, save it to a tar, ship it plus
# remote-deploy.sh to the server, then run that script over there. Safe to
# re-run any time you want to push a new build — it does not touch the
# Postgres data volume, and it never runs on an empty tag (remote-deploy.sh
# recreates only the `app` service).
#
# This script only handles the LOCAL half (build/save/ship). The actual
# cutover logic lives in remote-deploy.sh — single source of truth, so a fix
# there (like the base64-password bug that broke DATABASE_URL) only needs to
# happen once instead of drifting between two near-duplicate copies.
#
# Usage:
#   bash deploy.sh
#
# You'll be prompted for the server password by ssh/scp (2-3 times) unless
# you've set up SSH key auth. To do that once and skip the prompts:
#   ssh-copy-id root@13.140.138.252

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

# ---- Configuration ----
SERVER_USER="root"
SERVER_IP="13.140.138.252"
REMOTE_DIR="/root/aqar-mudr-web"
IMAGE_NAME="aqar-mudar"
IMAGE_TAG="latest"
TAR_PATH="dist/${IMAGE_NAME}.tar"
COMPOSE_FILE="docker-compose.prod.yml"
DOMAIN="aqar-mudr.bassir.net"

echo "==> [1/4] Building ${IMAGE_NAME}:${IMAGE_TAG} from $(pwd)"
docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" .

echo "==> [2/4] Saving image to ${TAR_PATH}"
mkdir -p dist
docker save -o "${TAR_PATH}" "${IMAGE_NAME}:${IMAGE_TAG}"
ls -lh "${TAR_PATH}"

echo "==> [3/4] Copying tar + compose file + deploy script to ${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}"
ssh "${SERVER_USER}@${SERVER_IP}" "mkdir -p '${REMOTE_DIR}'"
scp "${TAR_PATH}" "${COMPOSE_FILE}" remote-deploy.sh "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/"

echo "==> [4/4] Running remote-deploy.sh on the server"
ssh "${SERVER_USER}@${SERVER_IP}" "cd '${REMOTE_DIR}' && bash remote-deploy.sh"

echo "==> Done. Verify: https://${DOMAIN}/api/health"
