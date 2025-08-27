#!/bin/bash

set -euo pipefail

prettier --ignore-path "../../.prettierignore" --check .
eslint --ignore-path "../../.eslintignore" .
esbuild index.js --bundle --outfile="build/worker.js" --log-level="warning"
