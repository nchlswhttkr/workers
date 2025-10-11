#!/bin/bash

set -euo pipefail

prettier --check .
eslint .
