#!/bin/bash

set -eu

prettier --check "**/*.js"

source ../../set-cloudflare-secrets.sh
wrangler publish
