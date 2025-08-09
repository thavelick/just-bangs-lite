#!/bin/bash

# CI deployment script
# Replaces CACHE_BUST_VALUE with a random value for cache invalidation

set -e

# Generate random cache bust value using timestamp + random string
TIMESTAMP=$(date +%s)
RANDOM_STRING=$(head /dev/urandom | tr -dc a-z0-9 | head -c 6)
CACHE_BUST_VALUE="${TIMESTAMP}-${RANDOM_STRING}"

echo "Updating cache bust value to: ${CACHE_BUST_VALUE}"

# Replace placeholder in service worker
sed -i.bak "s/CACHE_BUST_VALUE/${CACHE_BUST_VALUE}/g" public_html/service-worker-lib.js

# Verify replacement worked
if grep -q "CACHE_BUST_VALUE" public_html/service-worker-lib.js; then
    echo "Error: CACHE_BUST_VALUE placeholder was not replaced"
    exit 1
fi

echo "✓ Cache bust value updated successfully"
echo "✓ Ready for deployment"