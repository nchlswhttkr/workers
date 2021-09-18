#!/bin/bash

set -euo pipefail

# USAGE
# ./cloudflare-kv-bulk-delete.sh my_bucket_name "keys-with-prefix*"
# ./cloudflare-kv-bulk-delete.sh my_bucket_name "exact-match"

KV_NAMESPACE=$1
PATTERN=$2

CF_ACCOUNT_ID=$(pass show workers/cloudflare-account-id)
CF_API_TOKEN=$(pass show workers/cloudflare-api-token)
KEYS_FILE=$(mktemp)

# Get ID of the provided namespace
KV_NAMESPACE_ID=$(
    curl --silent --fail "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/storage/kv/namespaces" -H "Authorization: Bearer $CF_API_TOKEN" \
        | jq --raw-output ".result[] | select(.title == \"$KV_NAMESPACE\") | .id"
)

# Find matching keys
if [[ $PATTERN =~ \*$ ]]; then
    PREFIX=${PATTERN%\*}
    curl --silent --fail "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/storage/kv/namespaces/$KV_NAMESPACE_ID/keys?prefix=$PREFIX" -H "Authorization: Bearer $CF_API_TOKEN" \
        | jq "[.result[].name]" > "$KEYS_FILE"
else
    # An exact match _should not_ delete KV pairs with a matching prefix
    echo -e "\033[33mDeleting key by exact match!\033[0m"
    echo "[\"$PATTERN\"]" > "$KEYS_FILE"
fi


KEY_COUNT=$(jq --raw-output "length" "$KEYS_FILE")
if [[ $KEY_COUNT -eq "0" ]]; then
    echo -e "\033[33mFound no keys matching '$PATTERN', skipping delete\033[0m"
    exit 0
fi

# Require manual confirmation before proceeding with delete operation
echo -e "This will delete \033[33m$KEY_COUNT\033[0m KV pairs"
read -rp "Enter this number to confirm > " DELETE_COUNT
if [[ $KEY_COUNT != "$DELETE_COUNT" ]]; then
    echo -e "\033[31mDifferent number of keys specified, skipping delete\033[0m"
    exit 1
fi

# Take a backup beforehand of all matching keys
BACKUP_KV_PAIRS_DIR=$(mktemp -d)
echo "Saving a backup of $KEY_COUNT KV pairs to $BACKUP_KV_PAIRS_DIR"
jq --raw-output ".[]" "$KEYS_FILE" \
    | xargs -P 8 -I "{}" \
        curl --silent --fail "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/storage/kv/namespaces/$KV_NAMESPACE_ID/values/{}" -H "Authorization: Bearer $CF_API_TOKEN" --output "$BACKUP_KV_PAIRS_DIR/{}.txt"
if [[ $(uname -s) == "Darwin" ]]; then echo -n "$BACKUP_KV_PAIRS_DIR" | pbcopy; fi
if [[ $(find "$BACKUP_KV_PAIRS_DIR" -mindepth 1 | wc -l | tr -d ' ') != "$KEY_COUNT" ]]; then
    echo -e "\033[31mBackup failed (some KV pairs are missing), deletion will be skipped\033[0m"
    exit 1
fi

# Bulk delete keys
curl --fail -X DELETE "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/storage/kv/namespaces/$KV_NAMESPACE_ID/bulk" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data @"$KEYS_FILE"

echo -e "\033[32mDeleted all KV pairs successfully\033[0m"
