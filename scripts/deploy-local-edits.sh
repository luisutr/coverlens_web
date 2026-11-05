#!/usr/bin/env bash
# Publica ediciones manuales al VPS (índices + catálogo + browse API).
set -euo pipefail
RESOURCE_ROOT="$(cd "$(dirname "$0")/../../coverlens_resource" && pwd)"
exec "$RESOURCE_ROOT/scripts/deploy-prod.sh" local-edits
