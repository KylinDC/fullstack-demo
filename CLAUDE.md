# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a fullstack TypeScript monorepo with separate frontend and backend applications managed by pnpm workspaces.

**Tech Stack:**
- Frontend: Vite + React + shadcn/ui + Tailwind CSS
- Backend: Hono.js + Drizzle ORM + Cloudflare D1 (SQLite)
- Testing: Vitest for both frontend and backend
- Package Manager: pnpm (using workspaces)
- Deployment: Cloudflare Workers (backend) + GitHub Pages (frontend)
- CI/CD: GitHub Actions
- Use biomejs for lint and formatter

## Repository Structure

```
/
├── apps/
│   ├── frontend/          # Vite + React application
│   └── backend/           # Hono.js + Cloudflare Workers API
│       ├── wrangler.jsonc # Cloudflare Workers configuration
│       └── drizzle/       # Database migrations
├── packages/              # Shared packages (if any)
├── .github/
│   └── workflows/         # CI/CD pipelines
│       ├── deploy-frontend.yml
│       └── deploy-backend.yml
└── package.json           # Root workspace configuration
```

## Development Commands

### Initial Setup
```bash
# Install dependencies (from root)
pnpm install

# Login to Cloudflare (first time only)
cd apps/backend
pnpm cf:login

# Create D1 database (first time only - for production)
pnpm db:create      # Note the database_id and add it to wrangler.jsonc

# Setup local database
pnpm db:generate    # Generate migrations from schema
pnpm db:push:local  # Push schema to local database
pnpm db:seed        # Seed with sample data
pnpm db:studio      # Open Drizzle Studio (optional)
```

### Frontend Development
```bash
cd apps/frontend
pnpm dev            # Start dev server (usually http://localhost:5173)
pnpm build          # Build for production
pnpm preview        # Preview production build
pnpm test           # Run tests
pnpm test:ui        # Run tests with UI
pnpm lint           # Run ESLint
```

### Backend Development
```bash
cd apps/backend
# Local development options:
pnpm dev            # Start Wrangler dev server (Cloudflare Workers local)
pnpm dev:node       # Start Node.js dev server (faster for testing)

# Deployment
pnpm build          # Build TypeScript
pnpm deploy         # Deploy to Cloudflare Workers (production)
pnpm deploy:staging # Deploy to staging environment

# Testing
pnpm test           # Run tests
pnpm test:ui        # Run tests with UI

# Database operations
pnpm db:generate    # Generate migrations from schema changes
pnpm db:push:local  # Push schema to local database
pnpm db:seed        # Seed local database
pnpm db:migrate:remote  # Apply migrations to production D1 database
pnpm db:studio      # Open Drizzle Studio
```

### Running Tests
```bash
# From root - run all tests
pnpm test

# Run specific workspace tests
pnpm --filter frontend test
pnpm --filter backend test

# Watch mode for a single test file
cd apps/frontend  # or apps/backend
pnpm test path/to/test.test.ts
```

## Docker Setup (Optional)

Docker support is available for local containerized development with SQLite. This is optional - the recommended development approach is using `pnpm dev:node` locally or deploying to Cloudflare Workers.

### Quick Start with Docker

```bash
# Production mode
docker-compose up --build

# Development mode (with hot reload)
docker-compose -f docker-compose.dev.yml up
```

### Key Features
- **SQLite database** - No separate database container needed
- **Volume persistence** - Database stored in Docker volume
- **Hot reload** - Development mode supports live code updates
- **Automatic initialization** - Database schema and seed data created on first run

### Important Notes
- Docker uses SQLite (same as local dev and Cloudflare D1)
- Database is automatically initialized via `docker-entrypoint.sh`
- For detailed Docker documentation, see [DOCKER.md](../DOCKER.md)
- For production deployments, **Cloudflare Workers is recommended** over Docker

### When to Use Docker
- ✅ Consistent development environment across team
- ✅ Testing production-like build locally
- ✅ Self-hosted deployment scenarios
- ❌ Not needed for Cloudflare Workers deployment
- ❌ Slower than native development

## Architecture Notes

### Frontend Architecture
- React components should follow composition patterns
- Use shadcn/ui components as base UI primitives
- Tailwind CSS for styling (utility-first approach)
- State management: React hooks (useState, useContext, etc.)
- API calls should be organized in a dedicated services/api layer

### Backend Architecture
- Hono.js provides the HTTP routing layer (compatible with both Cloudflare Workers and Node.js)
- Drizzle ORM handles database interactions with type-safe queries
- Cloudflare D1 for production (SQLite-based serverless database)
- Local development uses better-sqlite3 with the same schema
- Database schema defined in Drizzle schema files (typically `schema.ts`)
- API routes should be organized by domain/resource
- Middleware stack: CORS, logging, error handling
- Dual runtime support: Cloudflare Workers for production, Node.js for local dev

### Database Workflow
- Schema changes: Update Drizzle schema files (using SQLite syntax)
- Generate migrations: `pnpm db:generate` (creates SQL in drizzle/ folder)
- Local development: `pnpm db:push:local` (push schema directly to local SQLite)
- Production: `pnpm db:migrate:remote` (apply migrations to D1)
- Seed data: `pnpm db:seed` (local only)
- Schema is the source of truth for TypeScript types
- Local and production use the same schema (SQLite-compatible)

### TypeScript Configuration
- Strict mode enabled across all workspaces
- Shared types can be defined in a `packages/types` directory
- Path aliases configured in `tsconfig.json` for cleaner imports

### Testing Strategy
- Vitest used for unit and integration tests
- Frontend: Component testing with React Testing Library
- Backend: API endpoint testing with Hono's test utilities
- Test files colocated with source files using `.test.ts` or `.test.tsx` extension

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8787  # Wrangler dev server
# or
VITE_API_URL=https://your-worker.workers.dev  # Production
```

### Backend (Local Development)
```
NODE_ENV=development
PORT=3000  # Only used for dev:node
```

### Backend (Production - Cloudflare Workers)
Environment variables are configured in `wrangler.jsonc`:
- D1 database bindings
- Environment-specific variables
- Secrets managed via `wrangler secret put`

## Key Dependencies

### Frontend
- `react`, `react-dom` - UI library
- `vite` - Build tool
- `tailwindcss` - CSS framework
- `@radix-ui/*` - Primitives for shadcn/ui components
- `vitest`, `@testing-library/react` - Testing

### Backend
- `hono` - Web framework (works in Workers and Node.js)
- `drizzle-orm` - ORM with D1 and SQLite support
- `@cloudflare/workers-types` - TypeScript types for Workers
- `wrangler` - Cloudflare Workers CLI
- `better-sqlite3` - Local SQLite database for development
- `drizzle-kit` - CLI for migrations and schema management
- `vitest` - Testing

## Common Patterns

### Adding a new API endpoint (Backend)
1. Define route in appropriate router file
2. Create handler function with proper typing
3. Add database queries using Drizzle if needed
4. Write tests for the endpoint

### Adding a new feature (Frontend)
1. Create component in appropriate directory
2. Use shadcn/ui components for UI primitives
3. Add Tailwind classes for styling
4. Create API service functions if backend integration needed
5. Write component tests

### Database Schema Changes
1. Modify schema in Drizzle schema files (`src/db/schema.ts`)
2. Run `pnpm db:generate` to create migration SQL
3. Review generated SQL in `drizzle/` folder
4. For local: `pnpm db:push:local` to apply to local database
5. For production: `pnpm db:migrate:remote` to apply to D1
6. TypeScript types auto-sync from schema

## Cloudflare Workers Architecture

### Dual Runtime Support
The backend is designed to run in both environments:
- **Cloudflare Workers** (production): Serverless, edge-deployed, uses D1 binding
- **Node.js** (local dev): Traditional server, uses better-sqlite3

### How It Works
1. **Entry Point** (`src/index.ts`):
   - Exports Hono app for Workers
   - Conditionally starts Node.js server for local dev

2. **Database Layer** (`src/db/index.ts`):
   - `createDb()`: Creates DB instance with D1 binding (Workers)
   - `createLocalDb()`: Creates DB instance with SQLite (Node.js)
   - Routes detect runtime and use appropriate instance

3. **Configuration** (`wrangler.jsonc`):
   - Defines D1 database bindings
   - Sets compatibility date and Node.js compatibility
   - Configures staging/production environments

### Local Development Flow
1. Start dev server: `pnpm dev:node` or `pnpm dev`
2. Database stored in: `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/db.sqlite`
3. Schema changes: Update schema → Generate → Push local
4. Seed data: `pnpm db:seed`

### Production Deployment Flow
1. Update `wrangler.jsonc` with production D1 `database_id`
2. Run migrations: `pnpm db:migrate:remote`
3. Deploy: `pnpm deploy`
4. Workers automatically use D1 binding from environment

## CI/CD Pipeline

### GitHub Actions Workflows

**Frontend Deployment (`deploy-frontend.yml`)**
- Triggered on push to main (path: `apps/frontend/**`)
- Steps:
  1. Checkout code
  2. Setup pnpm and install dependencies
  3. Run tests
  4. Build production bundle
  5. Deploy to GitHub Pages automatically
- Environment variables injected from GitHub Secrets
- Requires GitHub Pages to be enabled in repository settings

**Backend Deployment (`deploy-backend.yml`)**
- Triggered on push to main (path: `apps/backend/**`)
- Steps:
  1. Checkout code
  2. Setup pnpm and install dependencies
  3. Run tests
  4. Build TypeScript
  5. Deploy to Cloudflare Workers using Wrangler
  6. Apply D1 migrations to production database
- Secrets: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
- Environment variables from `wrangler.jsonc`

### Deployment Strategy
- Frontend: GitHub Pages (static site, automatically deployed via Actions)
- Backend: Cloudflare Workers (serverless, edge-deployed globally)
- Database: Cloudflare D1 (serverless SQLite, managed by Cloudflare)
- Zero-downtime deployments with instant rollback capability
- Global edge network for low-latency responses
- Automatic scaling with no infrastructure management

### Pre-deployment Checks
Both pipelines include:
- TypeScript type checking
- Linting
- Unit and integration tests
- Build verification
