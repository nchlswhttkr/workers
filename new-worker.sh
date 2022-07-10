#!/bin/bash

# $1    Name for package/worker (for example, hello-world)

set -euo pipefail

# Copy the template worker
find "workers/template-worker" -type f | while read -r TEMPLATE_FILE; do
  DESTINATION="workers/$1/${TEMPLATE_FILE#*template-worker/}"
  mkdir -p "$(dirname "$DESTINATION")"
  sed "s/template-worker/$1/" < "$TEMPLATE_FILE" > "$DESTINATION"
done

# Jump to adding the worker for Rush to build
echo -n ",
    {
      \"packageName\": \"@nchlswhttkr/$1\",
      \"projectFolder\": \"workers/$1\"
    }" | pbcopy
code --goto rush.json:291