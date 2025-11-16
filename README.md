# Fullstack Demo

A modern fullstack TypeScript monorepo with React frontend and Hono.js backend.

## Tech Stack

- **Frontend:** Vite + React + shadcn/ui + Tailwind CSS
- **Backend:** Hono.js + Drizzle ORM + PostgreSQL
- **Testing:** Vitest (frontend & backend)
- **Package Manager:** pnpm with workspaces
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Code Quality:** Biome (linting & formatting)

## Prerequisites

- Node.js 22+
- pnpm 9+
- Docker & Docker Compose (for containerized setup)
- PostgreSQL (for local development without Docker)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Environment Variables

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Frontend
cp apps/frontend/.env.example apps/frontend/.env
```

### 3. Start with Docker (Recommended)

```bash
# Start all services (PostgreSQL + Backend)
docker-compose up

# Or in detached mode
docker-compose up -d

# For development with hot reload
docker-compose -f docker-compose.dev.yml up
```

The backend will be available at `http://localhost:3000` and the database at `localhost:5432`.

### 4. Start without Docker

```bash
# Make sure PostgreSQL is running locally
# Update DATABASE_URL in apps/backend/.env

# Terminal 1 - Start backend
cd apps/backend
pnpm dev

# Terminal 2 - Start frontend
cd apps/frontend
pnpm dev
```

### 5. Initialize Database

```bash
cd apps/backend

# Push schema to database
pnpm db:push

# Or generate and run migrations
pnpm db:generate
pnpm db:migrate

# Open Drizzle Studio to manage data
pnpm db:studio
```

## Project Structure

```
fullstack-demo/
├── apps/
│   ├── backend/              # Hono.js API server
│   │   ├── src/
│   │   │   ├── db/          # Database schema & connection
│   │   │   ├── routes/      # API routes
│   │   │   └── index.ts     # App entry point
│   │   ├── Dockerfile
│   │   └── package.json
│   └── frontend/             # React application
│       ├── src/
│       │   ├── components/  # React components
│       │   │   └── ui/      # shadcn/ui components
│       │   ├── lib/         # Utilities
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── Dockerfile
│       └── package.json
├── .github/
│   └── workflows/           # CI/CD pipelines
├── docker-compose.yml       # Production setup
├── docker-compose.dev.yml   # Development setup
├── biome.json              # Linting & formatting config
└── package.json            # Root workspace config
```

## Available Scripts

### Root (Monorepo)

```bash
pnpm dev          # Start all apps in development mode
pnpm build        # Build all apps
pnpm test         # Run all tests
pnpm lint         # Lint all code
pnpm format       # Format all code
pnpm format:check # Check code formatting
```

### Backend

```bash
cd apps/backend

pnpm dev          # Start dev server with hot reload
pnpm build        # Build for production
pnpm start        # Run production build
pnpm test         # Run tests
pnpm test:ui      # Run tests with UI
pnpm db:generate  # Generate migrations
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Drizzle Studio
```

### Frontend

```bash
cd apps/frontend

pnpm dev          # Start dev server (http://localhost:5173)
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm test         # Run tests
pnpm test:ui      # Run tests with UI
pnpm lint         # Lint code
```

## Docker Commands

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild containers
docker-compose up --build

# View logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Run commands in containers
docker-compose exec backend pnpm db:push
docker-compose exec backend pnpm test
```

## API Endpoints

- `GET /health` - Health check
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

## Database Schema

The database uses Drizzle ORM with PostgreSQL. Schema is defined in `apps/backend/src/db/schema.ts`.

**Users Table:**
- `id` - Serial primary key
- `name` - Text, required
- `email` - Text, unique, required
- `createdAt` - Timestamp, auto-generated

## Testing

Both frontend and backend use Vitest for testing.

```bash
# Run all tests
pnpm test

# Run tests for specific workspace
pnpm --filter backend test
pnpm --filter frontend test

# Run tests in watch mode
cd apps/backend && pnpm test:watch
cd apps/frontend && pnpm test:watch
```

## Deployment

### GitHub Actions

Two workflows are configured:

1. **Backend Deployment** (`.github/workflows/deploy-backend.yml`)
   - Triggers on changes to `apps/backend/**`
   - Runs tests and builds Docker image
   - Pushes to Docker Hub
   - Ready for deployment to AWS ECS, GCP Cloud Run, or Railway

2. **Frontend Deployment** (`.github/workflows/deploy-frontend.yml`)
   - Triggers on changes to `apps/frontend/**`
   - Runs tests and builds static files
   - Ready for deployment to Vercel, Netlify, or AWS S3

### Required Secrets

Configure these in GitHub repository settings:

- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password
- `VITE_API_URL` - Production API URL
- Additional secrets based on deployment target

## Code Quality

The project uses Biome for linting and formatting:

```bash
# Check code quality
pnpm lint

# Format code
pnpm format

# Check if code is formatted
pnpm format:check
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT
