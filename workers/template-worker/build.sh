#!/bin/bash

set -euo pipefail

prettier --ignore-path "../../.prettierignore" --check "**/*.(js|json)"

export CLOUDFLARE_ACCOUNT_ID=$(pass show workers/cloudflare-account-id)
export CLOUDFLARE_API_TOKEN=$(pass show workers/cloudflare-api-token)

# pass show workers/template-worker/secret | wrangler secret put SECRET

# wrangler publish
