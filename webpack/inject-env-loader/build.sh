#!/bin/bash

set -euo pipefail

prettier --ignore-path "../../.prettierignore" --check "**/*.js"
