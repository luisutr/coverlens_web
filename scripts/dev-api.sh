#!/usr/bin/env bash
# Servidor PHP local apuntando al catálogo de coverlens_resource (Mac/Linux).
set -euo pipefail

WEB_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RESOURCE_ROOT="$(cd "$WEB_ROOT/../coverlens_resource" && pwd)"
DOCROOT="$RESOURCE_ROOT"
PORT="${PORT:-8080}"
HOST="${HOST:-127.0.0.1}"

if [[ ! -d "$RESOURCE_ROOT/data/games" ]]; then
  echo "No encuentro coverlens_resource en: $RESOURCE_ROOT" >&2
  exit 1
fi

echo "API PHP → http://${HOST}:${PORT}"
echo "Docroot: $DOCROOT"
echo "Vite:    npm run dev  →  http://localhost:5173"
echo ""

cd "$DOCROOT"
exec php -S "${HOST}:${PORT}" -t "$DOCROOT"
