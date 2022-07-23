#!/bin/bash

set -euo pipefail

prettier --ignore-path "../../.prettierignore" --check . "!feed.hbs" # Prettier is doing HTML validation on an XML file...
eslint --ignore-path "../../.eslintignore" .
# esbuild index.js --bundle --external:fs --outfile=build/worker.js --log-level="warning"
node esbuild.js

CLOUDFLARE_ACCOUNT_ID=$(pass show workers/cloudflare-account-id)
export CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN=$(pass show workers/cloudflare-api-token)
export CLOUDFLARE_API_TOKEN

wrangler publish
