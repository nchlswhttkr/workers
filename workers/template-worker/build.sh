#!/bin/bash

set -euo pipefail

prettier --ignore-path "../../.prettierignore" --check .
eslint --ignore-path "../../.eslintignore" .
tsc

VAULT_TOKEN="$(pass show vault/root-token)"
export VAULT_TOKEN

CLOUDFLARE_ACCOUNT_ID=$(vault kv get -field cloudflare-account-id buildkite/workers)
export CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN=$(vault kv get -field cloudflare-api-token buildkite/workers)
export CLOUDFLARE_API_TOKEN

# vault kv get -field secret buildkite/workers/template-worker | wrangler secret put SECRET

# wrangler deploy
