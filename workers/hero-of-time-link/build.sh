#!/bin/bash

set -eu

prettier "**/*.js"

source ../../set-cloudflare-secrets.sh
wrangler publish
