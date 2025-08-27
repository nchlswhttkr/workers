#!/bin/bash

set -euo pipefail

prettier --ignore-path "../../.prettierignore" --check .
eslint --ignore-path "../../.eslintignore" .
tsc

if [[ -z "${VAULT_TOKEN:-}" ]]; then
    VAULT_TOKEN="$(pass show vault/root-token)"
    export VAULT_TOKEN
fi

CLOUDFLARE_ACCOUNT_ID=$(vault kv get -field cloudflare-account-id buildkite/workers)
export CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN=$(vault kv get -field cloudflare-api-token buildkite/workers)
export CLOUDFLARE_API_TOKEN

if [[ "${CI:-}" == "true" ]]; then
    pass show up/access-token | wrangler secret put UP_ACCESS_TOKEN
fi
vault kv get -field up-webhook-secret-key buildkite/workers/belles | wrangler secret put UP_WEBHOOK_SECRET_KEY

wrangler deploy
