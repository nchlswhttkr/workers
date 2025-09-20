#!/bin/bash

# $1  Name for package/worker, for example "hello-world"
# $2  Environment name for Honeycomb secret, defaults to "prod"

set -euo pipefail

WORKER="$1"
ENVIRONMENT="${2:-prod}"
HONEYCOMB_API_KEY="$(vault kv get -field "honeycomb-api-key-$ENVIRONMENT" buildkite/workers)"

# Annotate CI builds with additional information
if [[ "${BUILDKITE:-}" == "true" ]]; then
  MESSAGE="Deployed from Buildkite build #$BUILDKITE_BUILD_NUMBER"
  URL="$BUILDKITE_BUILD_URL"
else
  MESSAGE="Deployed from $(hostname)"
fi

# Dataset must exist before creating markers
curl --fail --location --show-error --silent "https://api.honeycomb.io/1/datasets" \
  -H "X-Honeycomb-Team: $HONEYCOMB_API_KEY" \
  -H 'Content-Type: application/json' \
  --data-binary @- << EOF
    {
      "name": "$WORKER"
    }
EOF

curl --fail --location --show-error --silent "https://api.honeycomb.io/1/markers/$WORKER" \
  -H "X-Honeycomb-Team: $HONEYCOMB_API_KEY" \
  -H 'Content-Type: application/json' \
  --data-binary @- << EOF
    {
      "message": "$MESSAGE",
      "type": "deploy",
      "url": "${URL:-}"
    }
EOF
