#!/bin/bash

set -euo pipefail

prettier --check src/
rollup -c
