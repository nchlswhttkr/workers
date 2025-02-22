#!/bin/bash

set -euo pipefail

prettier --ignore-path "../../.prettierignore" --check .
eslint --ignore-path "../../.eslintignore" .

CLOUDFLARE_ACCOUNT_ID=$(pass show workers/cloudflare-account-id)
export CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN=$(pass show workers/cloudflare-api-token)
export CLOUDFLARE_API_TOKEN

pass show workers/newsletter-subscription-form/mailgun-api-key | wrangler secret put MAILGUN_API_KEY
pass show workers/newsletter-subscription-form/email-signing-secret | wrangler secret put EMAIL_SIGNING_SECRET

wrangler deploy
