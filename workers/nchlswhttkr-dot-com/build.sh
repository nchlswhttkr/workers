#!/bin/bash

set -euo pipefail

prettier --ignore-path "../../.prettierignore" --check .
eslint --ignore-path "../../.eslintignore" .

CLOUDFLARE_ACCOUNT_ID=$(pass show workers/cloudflare-account-id)
export CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN=$(pass show workers/cloudflare-api-token)
export CLOUDFLARE_API_TOKEN

wrangler publish
