#!/bin/bash

set -eu

# USAGE
# ./cloudflare-kv-bulk-delete.sh my_bucket_name "keys-with-prefix*"

# TODO Delete keys by exact match

KV_NAMESPACE=$1
PATTERN=$2

if [[ $PATTERN =~ \*$ ]]; then
    PREFIX=${PATTERN%\*}
else
    echo "Expected pattern to match '<prefix>*'"
    exit 1
fi

source ./set-cloudflare-secrets.sh

KV_NAMESPACE_ID=$(
    # Bad hack to avoid JSON parsing, grab the ID of the matching namespace
    curl --silent --fail "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/storage/kv/namespaces" \
        -H "Authorization: Bearer $CF_API_TOKEN" | grep --context=1 "$KV_NAMESPACE" | sed -n "s/ *\"id\": \"\([0-9a-f]*\)\",/\1/p"
)

KEYS=$(
    # Bad hack to produce output as a JSON array
    echo "["
    curl --silent --fail "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/storage/kv/namespaces/$KV_NAMESPACE_ID/keys?prefix=$PREFIX" \
        -H "Authorization: Bearer $CF_API_TOKEN" | sed -n "s/ *\"name\": \(\".*\"\)/\1,/p"
    echo "\"dummy-key\"" # add dummy value to deal with trailing comma
    echo "]"
)

KEY_COUNT=$(tr -cd "," <<<$KEYS | wc -c)
if [[ $KEY_COUNT -eq "0" ]]; then
    echo Found no keys to be deleted, skipping...
    exit 0
fi

echo This will delete $KEY_COUNT KV pairs. Continue?
cat >> /dev/null

curl --fail -X DELETE "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/storage/kv/namespaces/$KV_NAMESPACE_ID/bulk" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data "$KEYS"
