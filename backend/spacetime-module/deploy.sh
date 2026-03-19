#!/usr/bin/env bash
# Deploy the SecureDeal SpacetimeDB module to maincloud.spacetimedb.com
# Prerequisites: SPACETIMEDB_TOKEN environment variable must be set.
set -euo pipefail

SPACETIMEDB_URL="https://maincloud.spacetimedb.com"
SPACETIMEDB_DB="cloud-assa/securedeal"

echo "=== SecureDeal SpacetimeDB Module Deployer ==="

# ── 1. Install spacetime CLI if not present ──────────────────────────────────
if ! command -v spacetime &>/dev/null; then
  echo "Installing spacetime CLI..."
  curl -fsSL https://install.spacetimedb.com | sh
  # Add to PATH for this session
  export PATH="$HOME/.spacetime/bin:$PATH"
fi

echo "spacetime CLI: $(spacetime --version)"

# ── 2. Verify token ──────────────────────────────────────────────────────────
if [ -z "${SPACETIMEDB_TOKEN:-}" ]; then
  echo "ERROR: SPACETIMEDB_TOKEN environment variable is not set."
  echo "  Generate one at https://maincloud.spacetimedb.com or via:"
  echo "  spacetime login --server ${SPACETIMEDB_URL}"
  exit 1
fi

# ── 3. Login using token ─────────────────────────────────────────────────────
echo "Logging in to ${SPACETIMEDB_URL}..."
spacetime login --server "${SPACETIMEDB_URL}" --token "${SPACETIMEDB_TOKEN}"

# ── 4. Publish module ────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Publishing module from ${SCRIPT_DIR}..."
spacetime publish \
  --server "${SPACETIMEDB_URL}" \
  --database "${SPACETIMEDB_DB}" \
  "${SCRIPT_DIR}"

echo ""
echo "=== Module published successfully ==="
echo "Database: ${SPACETIMEDB_DB}"
echo "Server:   ${SPACETIMEDB_URL}"
echo ""
echo "Set these environment variables in your backend/.env or docker-compose.yml:"
echo "  SPACETIMEDB_URL=${SPACETIMEDB_URL}"
echo "  SPACETIMEDB_DB=${SPACETIMEDB_DB}"
echo "  SPACETIMEDB_TOKEN=<your token>"
