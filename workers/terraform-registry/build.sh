#!/bin/bash

set -euo pipefail

prettier --ignore-path "../../.prettierignore" --check .
eslint --ignore-path "../../.eslintignore" .
esbuild index.js --bundle --outfile="build/worker.js" --log-level="warning"

CLOUDFLARE_ACCOUNT_ID=$(pass show workers/cloudflare-account-id)
export CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN=$(pass show workers/cloudflare-api-token)
export CLOUDFLARE_API_TOKEN

echo "7EA95E4ACCB088FE707E4B663CEA4082E10B8704" | wrangler secret put GPG_KEY_ID

wrangler publish
