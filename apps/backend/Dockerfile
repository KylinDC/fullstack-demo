# Build stage
FROM node:22-alpine AS builder

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/

# Install dependencies (includes better-sqlite3 compilation)
RUN pnpm install --frozen-lockfile

# Copy backend source
COPY apps/backend ./apps/backend

# Build backend
WORKDIR /app/apps/backend
RUN pnpm build

# Production stage
FROM node:22-alpine AS production

# Install runtime dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/

# Install all dependencies (including devDependencies for better-sqlite3)
RUN pnpm install --frozen-lockfile

# Copy built files from builder
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/src ./apps/backend/src
COPY --from=builder /app/apps/backend/drizzle ./apps/backend/drizzle
COPY --from=builder /app/apps/backend/drizzle.config.ts ./apps/backend/
COPY --from=builder /app/apps/backend/drizzle.local.config.ts ./apps/backend/
COPY --from=builder /app/apps/backend/tsconfig.json ./apps/backend/
COPY --from=builder /app/apps/backend/docker-entrypoint.sh ./apps/backend/

# Create database directory with proper permissions
RUN mkdir -p /app/apps/backend/.wrangler/state/v3/d1/miniflare-D1DatabaseObject

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Make entrypoint executable
RUN chmod +x /app/apps/backend/docker-entrypoint.sh

# Switch to non-root user
USER nodejs

WORKDIR /app/apps/backend

# Expose port
EXPOSE 3000

# Use entrypoint to initialize database
ENTRYPOINT ["/app/apps/backend/docker-entrypoint.sh"]

# Start the application (uses NODE_ENV to determine which mode)
CMD ["node", "dist/index.js"]


