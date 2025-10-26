#!/bin/bash

set -euo pipefail

# TODO: Support separate environments rather than sharing assets
ENVIRONMENT="${1:-}"

if [[ -z "${VAULT_TOKEN:-}" ]]; then
    VAULT_TOKEN="$(pass show vault/root-token)"
    export VAULT_TOKEN
fi

CLOUDFLARE_ACCOUNT_ID=$(vault kv get -field cloudflare-account-id buildkite/workers)
export CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN=$(vault kv get -field cloudflare-api-token buildkite/workers)
export CLOUDFLARE_API_TOKEN

find build -type f | while read -r FILE; do
    wrangler kv key put --remote --namespace-id 471ada112ddd46eca4f652291d8f633e "${FILE#*/}" --path "$FILE"
done
