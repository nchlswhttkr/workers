#!/bin/bash

set -eu

prettier "**/*.js"

curl --silent --fail https://nchlswhttkr.keybase.pub/shortcuts.json > shortcuts.json

source ../../set-cloudflare-secrets.sh
wrangler publish
