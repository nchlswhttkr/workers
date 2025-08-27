#!/bin/bash

set -euo pipefail

rush install
rush build

# TODO: Port terraform-registry to TypeScript so not relying on build artifacts
tar -cz -f build.tar.gz common/temp/ workers/terraform-registry/build
