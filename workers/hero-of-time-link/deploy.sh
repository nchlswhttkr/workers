#!/bin/bash

set -euo pipefail

ENVIRONMENT="${1:-}"

if [[ -z "${VAULT_TOKEN:-}" ]]; then
    VAULT_TOKEN="$(pass show vault/root-token)"
    export VAULT_TOKEN
fi

CLOUDFLARE_ACCOUNT_ID=$(vault kv get -field cloudflare-account-id buildkite/workers)
export CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN=$(vault kv get -field cloudflare-api-token buildkite/workers)
export CLOUDFLARE_API_TOKEN

wrangler deploy --env "$ENVIRONMENT"

../../scripts/create-honeycomb-marker.sh hero-of-time-link "$ENVIRONMENT"