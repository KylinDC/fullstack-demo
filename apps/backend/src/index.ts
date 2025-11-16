import usersRoute from '@/routes/users';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env } from '@/db';

// Create Hono app with environment type for Cloudflare Workers
const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.route('/api/users', usersRoute);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

// Export for Cloudflare Workers
export default app;

// Start Node.js server only when running with tsx/node directly (not in Workers runtime)
// Check for __filename which only exists in Node.js, not in Workers
if (typeof __filename !== 'undefined') {
  // Dynamic import to avoid bundling in Workers
  import('dotenv/config');
  import('@hono/node-server').then(({ serve }) => {
    const port = Number.parseInt(process.env.PORT || '3000');
    serve({
      fetch: app.fetch,
      port,
    });
    console.log(`🚀 Server is running on http://localhost:${port}`);
  });
}

