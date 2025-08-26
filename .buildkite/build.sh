#!/bin/bash

set -euo pipefail

npm install --global @microsoft/rush
rush update
rush build
