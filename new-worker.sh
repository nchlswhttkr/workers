#!/bin/bash

# $1    Name for package/worker (for example, hello-world)

set -eu

mkdir -p "workers/$1"

cp worker-template/index.js "workers/$1"
cp worker-template/build.sh "workers/$1"
sed "s/WORKER_NAME/$1/" < worker-template/package.json > "workers/$1/package.json"
sed "s/WORKER_NAME/$1/" < worker-template/wrangler.toml > "workers/$1/wrangler.toml"