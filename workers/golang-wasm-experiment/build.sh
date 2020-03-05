#!/bin/bash

set -euo pipefail

mkdir -p worker

tinygo version
tinygo build -o worker/main.wasm -target wasm main.go

if [ ! -f "wasm_exec.js" ]; then
    curl --silent --fail --output wasm_exec.js https://raw.githubusercontent.com/tinygo-org/tinygo/master/targets/wasm_exec.js
fi
webpack-cli --output worker/script.js

source ../../set-cloudflare-secrets.sh
export WORKER_NAME=golang-wasm-experiment
curl --silent --fail -X PUT "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/workers/scripts/$WORKER_NAME" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    -F "metadata=@metadata.json;type=application/json" \
    -F "script=@worker/script.js;type=application/javascript" \
    -F "wasm=@worker/main.wasm;type=application/wasm"
