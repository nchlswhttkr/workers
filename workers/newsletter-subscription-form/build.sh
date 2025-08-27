#!/bin/bash

set -euo pipefail

prettier --ignore-path "../../.prettierignore" --check .
eslint --ignore-path "../../.eslintignore" .

if [[ -z "${VAULT_TOKEN:-}" ]]; then
    VAULT_TOKEN="$(pass show vault/root-token)"
    export VAULT_TOKEN
fi

CLOUDFLARE_ACCOUNT_ID=$(vault kv get -field cloudflare-account-id buildkite/workers)
export CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN=$(vault kv get -field cloudflare-api-token buildkite/workers)
export CLOUDFLARE_API_TOKEN

vault kv get -field mailgun-api-key buildkite/workers/newsletter-subscription-form | wrangler secret put MAILGUN_API_KEY
vault kv get -field email-signing-secret buildkite/workers/newsletter-subscription-form | wrangler secret put EMAIL_SIGNING_SECRET

wrangler deploy
