#!/bin/bash

# Fullstack Demo - Setup Script
# This script helps you get started with the project

set -e

echo "🚀 Setting up Fullstack Demo..."
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "   npm install -g pnpm"
    exit 1
fi

echo "✅ pnpm is installed"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install

# Setup environment files
echo ""
echo "⚙️  Setting up environment files..."

if [ ! -f apps/backend/.env ]; then
    cp apps/backend/.env.example apps/backend/.env
    echo "✅ Created apps/backend/.env"
else
    echo "⚠️  apps/backend/.env already exists, skipping..."
fi

if [ ! -f apps/frontend/.env ]; then
    cp apps/frontend/.env.example apps/frontend/.env
    echo "✅ Created apps/frontend/.env"
else
    echo "⚠️  apps/frontend/.env already exists, skipping..."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo ""
echo "Option 1: Start with Docker (Recommended)"
echo "  docker-compose up"
echo "  cd apps/backend && pnpm db:push && pnpm db:seed"
echo ""
echo "Option 2: Start without Docker"
echo "  1. Make sure PostgreSQL is running locally"
echo "  2. Update DATABASE_URL in apps/backend/.env"
echo "  3. cd apps/backend && pnpm db:push && pnpm db:seed"
echo "  4. Terminal 1: cd apps/backend && pnpm dev"
echo "  5. Terminal 2: cd apps/frontend && pnpm dev"
echo ""
echo "📚 Check README.md for more information"
