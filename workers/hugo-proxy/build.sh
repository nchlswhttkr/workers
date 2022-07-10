#!/bin/bash

set -euo pipefail

prettier --ignore-path "../../.prettierignore" --check "**/*.(js|json)"
esbuild index.js --bundle --outfile="build/worker.js" --log-level="warning"

export CLOUDFLARE_ACCOUNT_ID=$(pass show workers/cloudflare-account-id)
export CLOUDFLARE_API_TOKEN=$(pass show workers/cloudflare-api-token)

pass show workers/hugo-proxy/writer-secret | wrangler secret put WRITER_SECRET
pass show workers/hugo-proxy/youtube-secret-key | wrangler secret put YOUTUBE_SECRET_KEY
pass show workers/hugo-proxy/vimeo-secret-key | wrangler secret put VIMEO_SECRET_KEY

wrangler publish
