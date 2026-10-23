#!/usr/bin/env bash
set -euo pipefail
base="${1:?Usage: health-smoke.sh https://approved-host}"
[[ "$base" =~ ^https://[a-zA-Z0-9.-]+$ ]] || { echo "HTTPS host required" >&2; exit 2; }
test "$(curl --proto '=https' --tlsv1.2 -fsS -o /dev/null -w '%{http_code}' "$base/healthz")" = 200
test "$(curl --proto '=https' --tlsv1.2 -fsS -o /dev/null -w '%{http_code}' "$base/readyz")" = 200
test "$(curl --proto '=https' --tlsv1.2 -fsS -o /dev/null -w '%{http_code}' "$base/admin")" != 200 || { echo "Unexpected anonymous admin response" >&2; exit 3; }
echo "Liveness/readiness and anonymous admin route checks passed."
