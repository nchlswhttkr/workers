#!/bin/bash

set -euo pipefail

prettier --ignore-path "../../.prettierignore" --check "**/*.js"

export CF_ACCOUNT_ID=$(pass show workers/cloudflare-account-id)
export CF_API_TOKEN=$(pass show workers/cloudflare-api-token)

pass show workers/hugo-proxy/writer-secret | wrangler secret put WRITER_SECRET
pass show workers/hugo-proxy/youtube-secret-key | wrangler secret put YOUTUBE_SECRET_KEY
pass show workers/hugo-proxy/vimeo-secret-key | wrangler secret put VIMEO_SECRET_KEY

wrangler publish 2>&1
