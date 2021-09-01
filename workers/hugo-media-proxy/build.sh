#!/bin/bash

set -euo pipefail

prettier --ignore-path "../../.prettierignore" --check "**/*.js"

export CF_ACCOUNT_ID=$(pass show workers/cloudflare-account-id)
export CF_API_TOKEN=$(pass show workers/cloudflare-api-token)
export CF_ZONE_ID=$(pass show workers/cloudflare-zone-id-nicholas.cloud)

wrangler publish 2>&1
