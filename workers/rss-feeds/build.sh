#!/bin/bash

set -euo pipefail

prettier --ignore-path "../../.prettierignore" --check "**/*.js"

export CF_ACCOUNT_ID=$(pass show workers/cloudflare-account-id)
export CF_API_TOKEN=$(pass show workers/cloudflare-api-token)

mkdir -p build/handlebars
handlebars feed.hbs -f build/handlebars/feed.hbs.js
esbuild index.js --bundle --external:fs --outfile=build/worker/main.js --log-level="warning"

wrangler publish 2>&1
