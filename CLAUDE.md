# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a fullstack TypeScript monorepo with separate frontend and backend applications managed by pnpm workspaces.

**Tech Stack:**
- Frontend: Vite + React + shadcn/ui + Tailwind CSS
- Backend: Hono.js + Drizzle ORM + PostgreSQL
- Testing: Vitest for both frontend and backend
- Package Manager: pnpm (using workspaces)
- Containerization: Docker + Docker Compose
- CI/CD: GitHub Actions
- Use biomejs for lint and formatter

## Repository Structure

```
/
├── apps/
│   ├── frontend/          # Vite + React application
│   │   └── Dockerfile     # Frontend production build
│   └── backend/           # Hono.js API server
│       └── Dockerfile     # Backend container
├── packages/              # Shared packages (if any)
├── .github/
│   └── workflows/         # CI/CD pipelines
│       ├── deploy-frontend.yml
│       └── deploy-backend.yml
├── docker-compose.yml     # Local development setup
└── package.json           # Root workspace configuration
```

## Development Commands

### Initial Setup
```bash
# Install dependencies (from root)
pnpm install

# Setup database
cd apps/backend
pnpm db:push        # Push schema to database
pnpm db:studio      # Open Drizzle Studio
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
pnpm dev            # Start dev server with hot reload
pnpm build          # Build for production
pnpm start          # Run production build
pnpm test           # Run tests
pnpm test:ui        # Run tests with UI
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

### Docker Commands

```bash
# Start all services (backend + postgres) for local development
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild containers after code changes
docker-compose up --build

# View logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Run backend tests in Docker
docker-compose run backend pnpm test

# Build backend image for production
cd apps/backend
docker build -t backend:latest .

# Build frontend image for production
cd apps/frontend
docker build -t frontend:latest .
```

## Architecture Notes

### Frontend Architecture
- React components should follow composition patterns
- Use shadcn/ui components as base UI primitives
- Tailwind CSS for styling (utility-first approach)
- State management: React hooks (useState, useContext, etc.)
- API calls should be organized in a dedicated services/api layer

### Backend Architecture
- Hono.js provides the HTTP routing layer
- Drizzle ORM handles database interactions with type-safe queries
- Database schema defined in Drizzle schema files (typically `schema.ts`)
- API routes should be organized by domain/resource
- Middleware stack: CORS, logging, error handling

### Database Workflow
- Schema changes: Update Drizzle schema files
- Generate migrations: `pnpm db:generate`
- Apply migrations: `pnpm db:push` or `pnpm db:migrate`
- Schema is the source of truth for TypeScript types

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
VITE_API_URL=http://localhost:3000
```

### Backend (.env)
```
# Local development
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
PORT=3000
NODE_ENV=development

# Docker development (when using docker-compose)
DATABASE_URL=postgresql://user:password@postgres:5432/dbname
```

### Docker (.env or docker-compose.yml)
```
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=dbname
```

## Key Dependencies

### Frontend
- `react`, `react-dom` - UI library
- `vite` - Build tool
- `tailwindcss` - CSS framework
- `@radix-ui/*` - Primitives for shadcn/ui components
- `vitest`, `@testing-library/react` - Testing

### Backend
- `hono` - Web framework
- `drizzle-orm` - ORM
- `postgres` or `pg` - PostgreSQL client
- `drizzle-kit` - CLI for migrations
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
1. Modify schema in Drizzle schema files
2. Run `pnpm db:generate` to create migration
3. Review generated SQL
4. Run `pnpm db:push` or `pnpm db:migrate`
5. Update TypeScript types will auto-sync from schema

## Docker Architecture

### Backend Dockerfile
- Multi-stage build for optimized production image
- Stage 1: Build TypeScript code
- Stage 2: Production runtime with only necessary files
- Uses Node.js Alpine for smaller image size
- Runs as non-root user for security

### Docker Compose Setup
- PostgreSQL service with persistent volume
- Backend service linked to PostgreSQL
- Hot reload enabled for development (volume mounts)
- Network isolation between services
- Health checks for database readiness

### Database Migrations in Docker
When running database migrations in Docker:
```bash
# Apply migrations
docker-compose exec backend pnpm db:push

# Open Drizzle Studio (needs port 4983 exposed)
docker-compose exec backend pnpm db:studio
```

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
  2. Run tests
  3. Build Docker image
  4. Push to container registry (Docker Hub/AWS ECR/GCP GCR)
  5. Deploy to hosting platform (AWS ECS/GCP Cloud Run/Railway)
  6. Run database migrations
- Secrets: DATABASE_URL, registry credentials, deployment tokens

### Deployment Strategy
- Frontend: GitHub Pages (automatically deployed via Actions)
- Backend: Containerized deployment with auto-scaling
- Database: Managed PostgreSQL service (AWS RDS/Supabase/Neon)
- Zero-downtime deployments with health checks
- Rollback capability via container versioning

### Pre-deployment Checks
Both pipelines include:
- TypeScript type checking
- Linting
- Unit and integration tests
- Build verification
