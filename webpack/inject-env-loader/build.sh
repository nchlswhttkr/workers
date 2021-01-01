#!/bin/bash

set -eu

prettier --ignore-path "../../.prettierignore" --check "**/*.js"
