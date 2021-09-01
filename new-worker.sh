#!/bin/bash

# $1    Name for package/worker (for example, hello-world)

set -euo pipefail

mkdir -p "workers/$1"
cp template-worker/index.js "workers/$1/"
sed "s/WORKER_NAME/$1/" < template-worker/README.md > "workers/$1/README.md"
sed "s/WORKER_NAME/$1/" < template-worker/build.sh > "workers/$1/build.sh"
sed "s/WORKER_NAME/$1/" < template-worker/package.json > "workers/$1/package.json"
sed "s/WORKER_NAME/$1/" < template-worker/wrangler.toml > "workers/$1/wrangler.toml"
echo -n ",
    {
      \"packageName\": \"@nchlswhttkr/$1\",
      \"projectFolder\": \"workers/$1\"
    }" | pbcopy
code --goto rush.json:291