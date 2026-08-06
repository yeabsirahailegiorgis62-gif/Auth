#!/bin/sh
set -e

echo "Waiting for database connection and synchronizing schema..."
until npx prisma db push; do
  echo "[Database Wait] Prisma db push retrying in 2 seconds..."
  sleep 2
done

echo "Database schema synchronized successfully."
echo "Starting NexusDocs Studio Backend Server..."
exec node src/server.js
