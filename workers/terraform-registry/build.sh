#!/bin/bash

set -euo pipefail

prettier --ignore-path "../../.prettierignore" --check .
esbuild index.js --bundle --outfile="build/worker.js" --log-level="warning"

export CLOUDFLARE_ACCOUNT_ID=$(pass show workers/cloudflare-account-id)
export CLOUDFLARE_API_TOKEN=$(pass show workers/cloudflare-api-token)

git config user.signingkey | wrangler secret put GPG_KEY_ID

wrangler publish
