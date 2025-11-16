# Docker Setup Guide (SQLite)

This guide explains how to run the fullstack application using Docker with SQLite database.

## Overview

The Docker setup has been updated to use SQLite instead of PostgreSQL:
- **No separate database service** - SQLite runs in the same container as the backend
- **Volume persistence** - Database is stored in a Docker volume
- **Dual compose files** - Production and development configurations

## Quick Start

### Production Mode

```bash
# Build and start all services
docker-compose up --build

# Stop services
docker-compose down

# Stop and remove volumes (⚠️ deletes database)
docker-compose down -v
```

Access:
- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:8080

### Development Mode (Hot Reload)

```bash
# Start with hot reload enabled
docker-compose -f docker-compose.dev.yml up

# Stop services
docker-compose -f docker-compose.dev.yml down
```

Access:
- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:5173 (Vite dev server)

## Architecture

### docker-compose.yml (Production)
- **backend**: Built from Dockerfile, runs compiled TypeScript
- **frontend**: Nginx serving static build
- **sqlite_data**: Named volume for database persistence

### docker-compose.dev.yml (Development)
- **backend**: Node.js container with hot reload (`pnpm dev:node`)
- **frontend**: Vite dev server with HMR
- **sqlite_data_dev**: Separate volume for dev database

## Database Management

### Initialize Database

The database is automatically initialized on first run via `docker-entrypoint.sh`:
1. Creates database directory
2. Runs `pnpm db:push:local` to create schema
3. Runs `pnpm db:seed` to populate sample data

### Manual Database Operations

```bash
# Access backend container
docker exec -it fullstack-demo-backend sh

# Inside container:
# Push schema changes
pnpm db:push:local

# Seed database
pnpm db:seed

# Open Drizzle Studio (won't work in container)
# Use local setup instead
```

### View Database Data

```bash
# Export database from Docker volume
docker cp fullstack-demo-backend:/app/apps/backend/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/db.sqlite ./local-backup.sqlite

# Inspect with sqlite3
sqlite3 local-backup.sqlite
.tables
SELECT * FROM users;
.quit
```

### Reset Database

```bash
# Stop containers
docker-compose down

# Remove volume (⚠️ deletes all data)
docker volume rm fullstack-demo_sqlite_data

# Restart - database will be reinitialized
docker-compose up
```

## File Structure

```
/
├── docker-compose.yml           # Production configuration
├── docker-compose.dev.yml       # Development configuration
├── .dockerignore                # Excludes .wrangler, node_modules, etc.
├── apps/
│   ├── backend/
│   │   ├── Dockerfile           # Multi-stage build for backend
│   │   └── docker-entrypoint.sh # Database initialization script
│   └── frontend/
│       └── Dockerfile           # Nginx static file server
```

## Dockerfile Explained

### Build Stage
1. Install build dependencies (python3, make, g++ for better-sqlite3)
2. Install pnpm and dependencies
3. Build TypeScript to JavaScript

### Production Stage
1. Install runtime dependencies
2. Copy built files and source (needed for db operations)
3. Create database directory
4. Set up non-root user for security
5. Use entrypoint script to initialize database

## Environment Variables

### Backend (docker-compose.yml)
```yaml
NODE_ENV: development  # Triggers SQLite mode instead of D1
PORT: 3000
```

### Backend (docker-compose.dev.yml)
```yaml
NODE_ENV: development
PORT: 3000
```

### Frontend
```yaml
VITE_API_URL: http://localhost:3000  # Points to backend
```

## Troubleshooting

### Database not persisting
- Ensure volume is mounted correctly in docker-compose.yml
- Check volume exists: `docker volume ls`
- Inspect volume: `docker volume inspect fullstack-demo_sqlite_data`

### Build fails with better-sqlite3 errors
- Ensure python3, make, g++ are installed in Dockerfile
- Clear build cache: `docker-compose build --no-cache`

### Permission denied errors
- Check directory ownership in Dockerfile
- Ensure nodejs user has write access to .wrangler directory

### Database initialization fails
- Check logs: `docker logs fullstack-demo-backend`
- Verify entrypoint script is executable
- Manually run initialization: `docker exec -it fullstack-demo-backend sh -c "pnpm db:push:local && pnpm db:seed"`

## Volumes

### sqlite_data (Production)
- Location: Docker managed volume
- Purpose: Persist production database
- Lifecycle: Survives container restarts
- Removal: `docker volume rm fullstack-demo_sqlite_data`

### sqlite_data_dev (Development)
- Location: Docker managed volume
- Purpose: Separate development database
- Lifecycle: Independent from production volume

## Performance Notes

- **SQLite in Docker**: Slower than native due to volume I/O overhead
- **Development**: Use `pnpm dev:node` locally for faster iteration
- **Production**: Docker provides consistent deployment environment
- **Database size**: SQLite is lightweight, suitable for small-to-medium datasets

## Migration from PostgreSQL

The following changes were made:
1. ❌ Removed PostgreSQL service from docker-compose.yml
2. ✅ Added SQLite volume mount
3. ✅ Updated Dockerfile with better-sqlite3 build dependencies
4. ✅ Created docker-entrypoint.sh for database initialization
5. ✅ Set NODE_ENV=development to trigger SQLite mode
6. ✅ Updated .dockerignore to exclude .wrangler directory

## Best Practices

1. **Development**: Use `docker-compose.dev.yml` for hot reload
2. **Production**: Use `docker-compose.yml` with pre-built images
3. **Database backups**: Regularly export SQLite file from volume
4. **Schema changes**: Update locally, rebuild containers
5. **Secrets**: Never commit .env files, use Docker secrets in production

## CI/CD Integration

For automated deployments, consider:
- Building images in CI pipeline
- Pushing to container registry
- Using Cloudflare Workers (recommended) instead of Docker
- Docker is best for local development and self-hosted deployments
