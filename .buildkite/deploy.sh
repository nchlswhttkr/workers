#!/bin/bash

set -euo pipefail

WORKER="$1"

buildkite-agent artifact download build.tar.gz . --step build
tar -xz f build.tar.gz

rush install

echo "--- Deploying $WORKER worker"
cd "workers/$WORKER"
rushx deploy
