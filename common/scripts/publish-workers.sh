#!/bin/bash

set -euo pipefail

source set-cloudflare-secrets.sh
pnpm recursive run publish-worker --filter ./workers
