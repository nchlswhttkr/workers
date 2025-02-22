#!/bin/bash

set -euo pipefail

prettier --ignore-path "../../.prettierignore" --check .
eslint --ignore-path "../../.eslintignore" .
esbuild index.js --bundle --outfile="build/worker.js" --log-level="warning"

CLOUDFLARE_ACCOUNT_ID=$(pass show workers/cloudflare-account-id)
export CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN=$(pass show workers/cloudflare-api-token)
export CLOUDFLARE_API_TOKEN

pass show workers/hugo-proxy/youtube-secret-key | wrangler secret put YOUTUBE_SECRET_KEY
pass show workers/hugo-proxy/vimeo-secret-key | wrangler secret put VIMEO_SECRET_KEY

wrangler deploy
