#!/bin/bash

set -eu

prettier --ignore-path "../../.prettierignore" --check "**/*.js"

export CF_ACCOUNT_ID=$(pass show workers/cloudflare-account-id)
export CF_API_TOKEN=$(pass show workers/cloudflare-api-token)
export CF_ZONE_ID=$(pass show workers/cloudflare-zone-id-nicholas.cloud)

pass show workers/newsletter-subscription-form/mailgun-api-key | wrangler secret put MAILGUN_API_KEY
pass show workers/newsletter-subscription-form/email-signing-secret | wrangler secret put EMAIL_SIGNING_SECRET

wrangler publish 2>&1
