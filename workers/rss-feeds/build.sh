#!/bin/bash

set -euo pipefail

prettier --ignore-path "../../.prettierignore" --check "**/*.(js|json)"
mkdir -p build/handlebars
handlebars feed.hbs -f build/feed.hbs.js
esbuild index.js --bundle --external:fs --outfile=build/worker.js --log-level="warning"

export CLOUDFLARE_ACCOUNT_ID=$(pass show workers/cloudflare-account-id)
export CLOUDFLARE_API_TOKEN=$(pass show workers/cloudflare-api-token)

wrangler publish
