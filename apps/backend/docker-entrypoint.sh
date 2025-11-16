#!/bin/sh
set -e

# Script to initialize database in Docker container

echo "🔧 Docker entrypoint: Setting up backend..."

# Wait a moment to ensure filesystem is ready
sleep 1

# Create database directory if it doesn't exist
mkdir -p .wrangler/state/v3/d1/miniflare-D1DatabaseObject

# Check if database exists
if [ ! -f .wrangler/state/v3/d1/miniflare-D1DatabaseObject/db.sqlite ]; then
  echo "📦 Database not found. Initializing..."

  # Push schema to create database
  pnpm db:push:local

  # Seed database with initial data
  echo "🌱 Seeding database..."
  pnpm db:seed

  echo "✅ Database initialized successfully!"
else
  echo "✅ Database already exists."
fi

# Start the application
echo "🚀 Starting application..."
exec "$@"
