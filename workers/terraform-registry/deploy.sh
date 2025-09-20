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

echo "1DF5BEB75522C8A8287D449C66CD7DECE10C7E3D" | wrangler secret put GPG_KEY_ID --env "$ENVIRONMENT"

wrangler deploy --env "$ENVIRONMENT"

../../scripts/create-honeycomb-marker.sh terraform-registry "$ENVIRONMENT"
