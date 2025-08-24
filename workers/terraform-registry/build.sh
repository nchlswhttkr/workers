#!/bin/bash

set -euo pipefail

prettier --ignore-path "../../.prettierignore" --check .
eslint --ignore-path "../../.eslintignore" .
esbuild index.js --bundle --outfile="build/worker.js" --log-level="warning"

VAULT_TOKEN="$(pass show vault/root-token)"
export VAULT_TOKEN

CLOUDFLARE_ACCOUNT_ID=$(vault kv get -field cloudflare-account-id buildkite/workers)
export CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN=$(vault kv get -field cloudflare-api-token buildkite/workers)
export CLOUDFLARE_API_TOKEN

echo "1DF5BEB75522C8A8287D449C66CD7DECE10C7E3D" | wrangler secret put GPG_KEY_ID

wrangler deploy
