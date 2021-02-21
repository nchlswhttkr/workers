#!/bin/bash

set -eu

prettier --ignore-path "../../.prettierignore" --check "**/*.js"

source ../../set-cloudflare-secrets.sh
wrangler publish 2>&1
