#!/bin/sh
set -e

echo "Waiting for database to accept connections..."
until npx prisma db push --skip-generate; do
  echo "Prisma db push failed - retrying in 2 seconds..."
  sleep 2
done

echo "Database schema synchronized successfully."
echo "Starting CollabWrite Studio Backend Server..."
exec node src/server.js
