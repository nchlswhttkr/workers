#!/bin/bash

set -eu

prettier --ignore-path "../../.prettierignore" --check "**/*.js"

export CF_ACCOUNT_ID=$(pass show workers/cloudflare-account-id)
export CF_API_TOKEN=$(pass show workers/cloudflare-api-token)
export WRITER_SECRET=$(pass show workers/hugo-proxy/writer-secret)
export YOUTUBE_SECRET_KEY=$(pass show workers/hugo-proxy/youtube-secret-key)
export VIMEO_SECRET_KEY=$(pass show workers/hugo-proxy/vimeo-secret-key)

wrangler publish 2>&1
