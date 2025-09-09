#!/bin/bash

set -euo pipefail

rush install
rush build

tar -cz -f build.tar.gz common/temp/
