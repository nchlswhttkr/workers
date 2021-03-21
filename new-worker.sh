#!/bin/bash

# $1    Name for package/worker (for example, hello-world)

set -eu

mkdir -p "workers/$1"
cp template-worker/index.js template-worker/build.sh "workers/$1/"
sed "s/WORKER_NAME/$1/" < template-worker/package.json > "workers/$1/package.json"
sed "s/WORKER_NAME/$1/" < template-worker/wrangler.toml > "workers/$1/wrangler.toml"
code "workers/$1/index.js"
