#!/bin/bash

set -euo pipefail

prettier --check src/
node esbuild.js
