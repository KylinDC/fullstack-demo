# Troubleshooting Guide

Common issues and their solutions when working with the Fullstack Demo project.

## Backend Issues

### Server Not Starting

**Symptom:** Backend fails to start or shows errors

**Solutions:**

1. **Check if port 3000 is already in use:**
   ```bash
   lsof -i :3000
   # Kill the process if needed
   kill -9 <PID>
   ```

2. **Verify dependencies are installed:**
   ```bash
   cd apps/backend
   pnpm install
   ```

3. **Check environment variables:**
   ```bash
   # Make sure .env file exists
   cp .env.example .env
   # Verify DATABASE_URL is correct
   cat .env
   ```

### Database Connection Error

**Symptom:** `Error: Connection refused` or database connection fails

**Solutions:**

1. **Verify PostgreSQL is running:**
   ```bash
   # For Docker
   docker-compose ps

   # For local PostgreSQL
   psql -l
   ```

2. **Check DATABASE_URL format:**
   ```bash
   # Should be:
   # postgresql://username:password@host:port/database

   # For Docker:
   DATABASE_URL=postgresql://postgres:postgres@postgres:5432/fullstack_demo

   # For local:
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fullstack_demo
   ```

3. **Test database connection:**
   ```bash
   cd apps/backend
   pnpm db:studio
   # If this opens successfully, connection is working
   ```

### Database Schema Not Found

**Symptom:** `relation "users" does not exist` or similar errors

**Solution:**
```bash
cd apps/backend
pnpm db:push     # Push schema to database
pnpm db:seed     # Add sample data (optional)
```

## Frontend Issues

### Proxy Error: /api/users

**Symptom:** Frontend shows proxy error or can't connect to API

**Solutions:**

1. **Ensure backend is running:**
   ```bash
   cd apps/backend
   pnpm dev
   # Should see: 🚀 Server is running on http://localhost:3000
   ```

2. **Test backend directly:**
   ```bash
   curl http://localhost:3000/health
   # Should return: {"status":"ok","timestamp":"..."}

   curl http://localhost:3000/api/users
   # Should return user data or empty array
   ```

3. **Restart frontend dev server:**
   ```bash
   cd apps/frontend
   # Stop the server (Ctrl+C)
   pnpm dev
   ```

4. **Check Vite proxy configuration:**
   Verify `apps/frontend/vite.config.ts` has:
   ```typescript
   proxy: {
     '/api': {
       target: 'http://localhost:3000',
       changeOrigin: true,
     },
   }
   ```

### Build Errors

**Symptom:** TypeScript errors or build failures

**Solutions:**

1. **Clear cache and rebuild:**
   ```bash
   # From project root
   rm -rf node_modules apps/*/node_modules
   rm -rf apps/*/dist
   pnpm install
   pnpm build
   ```

2. **Check TypeScript version:**
   ```bash
   pnpm list typescript
   # Should show ^5.6.3 or later
   ```

## Docker Issues

### Container Fails to Start

**Symptom:** Docker container exits immediately or shows errors

**Solutions:**

1. **Check logs:**
   ```bash
   docker-compose logs backend
   docker-compose logs postgres
   ```

2. **Rebuild containers:**
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

3. **Verify environment variables in docker-compose.yml**

### Database Connection in Docker

**Symptom:** Backend can't connect to PostgreSQL in Docker

**Solution:**

Make sure `DATABASE_URL` uses `postgres` as hostname (not `localhost`):
```bash
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/fullstack_demo
```

### Volume Permission Issues

**Symptom:** Permission denied errors in Docker

**Solution:**
```bash
# Reset volumes
docker-compose down -v
docker volume prune
docker-compose up
```

## Development Issues

### Hot Reload Not Working

**Symptom:** Changes to code don't reflect in browser/server

**Solutions:**

1. **Backend (tsx watch):**
   ```bash
   # Stop and restart
   cd apps/backend
   # Ctrl+C to stop
   pnpm dev
   ```

2. **Frontend (Vite):**
   ```bash
   # Stop and restart
   cd apps/frontend
   # Ctrl+C to stop
   pnpm dev
   ```

3. **Check file watcher limits (Linux):**
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

### Port Already in Use

**Symptom:** `EADDRINUSE` error

**Solutions:**

```bash
# Find and kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9

# Find and kill process on port 5432 (postgres)
lsof -ti:5432 | xargs kill -9
```

## Testing Issues

### Tests Fail to Run

**Symptom:** Vitest errors or test failures

**Solutions:**

1. **Clear test cache:**
   ```bash
   cd apps/backend  # or apps/frontend
   rm -rf node_modules/.vitest
   pnpm test
   ```

2. **Check test environment:**
   ```bash
   # Backend should have vitest.config.ts with:
   environment: 'node'

   # Frontend should have:
   environment: 'jsdom'
   ```

## Linting/Formatting Issues

### Biome Errors

**Symptom:** Linting or formatting fails

**Solutions:**

1. **Fix auto-fixable issues:**
   ```bash
   pnpm format
   pnpm lint --apply
   ```

2. **Check biome.json configuration:**
   ```bash
   cat biome.json
   ```

3. **Update Biome:**
   ```bash
   pnpm add -D @biomejs/biome@latest
   ```

## Installation Issues

### pnpm Install Fails

**Symptom:** Dependency installation errors

**Solutions:**

1. **Clear pnpm cache:**
   ```bash
   pnpm store prune
   rm -rf node_modules apps/*/node_modules
   rm pnpm-lock.yaml
   pnpm install
   ```

2. **Check Node.js version:**
   ```bash
   node --version
   # Should be v22.x.x or later
   ```

3. **Check pnpm version:**
   ```bash
   pnpm --version
   # Should be 9.x.x or later
   ```

## Network Issues

### CORS Errors

**Symptom:** Browser console shows CORS errors

**Solution:**

The backend has CORS enabled for all origins. If you still see errors:

1. Check that the backend has:
   ```typescript
   import { cors } from 'hono/cors';
   app.use('*', cors());
   ```

2. Restart both frontend and backend servers

### API Not Responding

**Symptom:** API requests timeout or hang

**Solutions:**

1. **Check backend is listening:**
   ```bash
   netstat -an | grep 3000
   # Should show: tcp4  0  0  *.3000  *.*  LISTEN
   ```

2. **Test with curl:**
   ```bash
   curl -v http://localhost:3000/health
   ```

3. **Check firewall settings** (if applicable)

## Getting More Help

If you continue to experience issues:

1. Check the logs carefully for error messages
2. Verify all prerequisites are installed (Node.js 22+, pnpm 9+)
3. Review the [GETTING_STARTED.md](./GETTING_STARTED.md) guide
4. Look for similar issues in the project repository
5. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)
