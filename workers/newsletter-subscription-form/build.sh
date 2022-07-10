#!/bin/bash

set -euo pipefail

prettier --ignore-path "../../.prettierignore" --check "**/*.(js|json)"

export CLOUDFLARE_ACCOUNT_ID=$(pass show workers/cloudflare-account-id)
export CLOUDFLARE_API_TOKEN=$(pass show workers/cloudflare-api-token)

pass show workers/newsletter-subscription-form/mailgun-api-key | wrangler secret put MAILGUN_API_KEY
pass show workers/newsletter-subscription-form/email-signing-secret | wrangler secret put EMAIL_SIGNING_SECRET

wrangler publish
