#!/bin/sh
set -eu

echo "Syncing database schema..."
node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss

echo "Starting Next.js on port ${PORT:-3000}..."
exec node server.js
