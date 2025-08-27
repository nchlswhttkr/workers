#!/bin/bash

set -euo pipefail

WORKER="$1"

rush install
rush build

echo "--- Deploying $WORKER worker"
cd "workers/$WORKER"
rushx deploy
