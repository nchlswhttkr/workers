#!/bin/bash

set -eu

mkdir -p worker

docker run registry.hub.docker.com/tinygo/tinygo-dev tinygo version
docker run -w "/source" -v "$PWD:/source" registry.hub.docker.com/tinygo/tinygo-dev bash -c "go get -d && tinygo build -o worker/main.wasm -target wasm main.go"

curl --silent --fail --output wasm_exec.js https://raw.githubusercontent.com/tinygo-org/tinygo/HEAD/targets/wasm_exec.js
webpack-cli --output worker/script.js

source ../../set-cloudflare-secrets.sh
export WORKER_NAME=buildkite-log-viewer
curl --silent --fail -X PUT "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/workers/scripts/$WORKER_NAME" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    -F "metadata=@metadata.json;type=application/json" \
    -F "script=@worker/script.js;type=application/javascript" \
    -F "wasm=@worker/main.wasm;type=application/wasm"
curl --silent --fail "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/workers/scripts/$WORKER_NAME/subdomain" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"enabled":true}'
