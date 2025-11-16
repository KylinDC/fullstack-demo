# Getting Started

This guide will help you set up and run the Fullstack Demo project.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js 22+**: [Download here](https://nodejs.org/)
- **pnpm 9+**: Install with `npm install -g pnpm`
- **Docker & Docker Compose**: [Download here](https://www.docker.com/products/docker-desktop/) (optional but recommended)
- **PostgreSQL**: Only needed if running without Docker

## Setup Options

### Option 1: Quick Setup Script (Recommended)

Run the setup script to automatically install dependencies and configure environment files:

```bash
./setup.sh
```

### Option 2: Manual Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Setup environment variables**
   ```bash
   # Backend
   cp apps/backend/.env.example apps/backend/.env

   # Frontend
   cp apps/frontend/.env.example apps/frontend/.env
   ```

## Running the Application

### With Docker (Recommended)

This is the easiest way to get started as it handles PostgreSQL setup automatically.

1. **Start all services**
   ```bash
   docker-compose up
   ```

2. **Initialize the database** (in a new terminal)
   ```bash
   cd apps/backend
   pnpm db:push    # Create database schema
   pnpm db:seed    # Add sample data
   ```

3. **Access the application**
   - Frontend: http://localhost:5173 (run `cd apps/frontend && pnpm dev` separately)
   - Backend API: http://localhost:3000
   - Database: localhost:5432

4. **View logs**
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f postgres
   ```

5. **Stop services**
   ```bash
   docker-compose down
   ```

### Without Docker

1. **Start PostgreSQL**

   Make sure PostgreSQL is running on your machine. Update the `DATABASE_URL` in `apps/backend/.env` to match your local setup:
   ```
   DATABASE_URL=postgresql://your_user:your_password@localhost:5432/fullstack_demo
   ```

2. **Initialize the database**
   ```bash
   cd apps/backend
   pnpm db:push    # Create database schema
   pnpm db:seed    # Add sample data
   ```

3. **Start the backend** (Terminal 1)
   ```bash
   cd apps/backend
   pnpm dev
   ```
   Backend will run on http://localhost:3000

4. **Start the frontend** (Terminal 2)
   ```bash
   cd apps/frontend
   pnpm dev
   ```
   Frontend will run on http://localhost:5173

## Database Management

### View and Edit Data

Open Drizzle Studio to view and edit database data:

```bash
cd apps/backend
pnpm db:studio
```

This will open a web interface at http://localhost:4983

### Database Migrations

When you make changes to the database schema:

```bash
cd apps/backend

# Generate migration files
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Or push schema directly (for development)
pnpm db:push
```

### Reseed Database

To reset and reseed the database:

```bash
cd apps/backend
pnpm db:push    # Resets schema
pnpm db:seed    # Adds sample data
```

## Testing

### Run All Tests

```bash
# From root
pnpm test

# Or for specific workspace
pnpm --filter backend test
pnpm --filter frontend test
```

### Run Tests in Watch Mode

```bash
cd apps/backend
pnpm test:watch

# Or with UI
pnpm test:ui
```

## Code Quality

### Linting

```bash
# Check all code
pnpm lint

# Lint specific workspace
cd apps/backend && pnpm lint
```

### Formatting

```bash
# Format all code
pnpm format

# Check formatting
pnpm format:check
```

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- Backend: Changes to `apps/backend/src/**` automatically restart the server
- Frontend: Changes to `apps/frontend/src/**` automatically refresh the browser

### API Proxy

The frontend dev server is configured to proxy API requests to the backend:
- Frontend requests to `/api/*` are forwarded to `http://localhost:3000`
- This avoids CORS issues during development

### Docker Development Mode

For development with Docker and hot reload:

```bash
docker-compose -f docker-compose.dev.yml up
```

This mounts your source code into the container so changes are reflected immediately.

## Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

```bash
# Check what's using the port
lsof -i :3000  # Backend
lsof -i :5173  # Frontend
lsof -i :5432  # PostgreSQL

# Kill the process
kill -9 <PID>
```

### Database Connection Error

1. Make sure PostgreSQL is running
2. Check your `DATABASE_URL` in `.env`
3. Verify the database exists: `psql -l`
4. Create it if needed: `createdb fullstack_demo`

### Docker Issues

```bash
# Reset everything
docker-compose down -v

# Rebuild containers
docker-compose up --build

# View logs
docker-compose logs -f
```

### pnpm Install Issues

```bash
# Clear pnpm cache
pnpm store prune

# Delete node_modules and reinstall
rm -rf node_modules apps/*/node_modules
pnpm install
```

## Next Steps

- Read the [README.md](../README.md) for project overview
- Check [CLAUDE.md](../CLAUDE.md) for development guidelines
- Explore the API at http://localhost:3000/health
- Start building features!

## Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page
- Review the documentation
- Look at the code examples in the source files
