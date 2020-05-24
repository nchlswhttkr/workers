#!/bin/bash

set -euo pipefail

prettier "**/*.js"

source ../../set-cloudflare-secrets.sh
wrangler publish
