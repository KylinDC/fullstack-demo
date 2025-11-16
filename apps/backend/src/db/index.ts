import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// Type for Cloudflare Workers environment bindings
export type Env = {
  DB: D1Database;
};

// Factory function to create db instance with D1 binding
export function createDb(binding: D1Database) {
  return drizzle(binding, { schema });
}

// For local Node.js development with better-sqlite3
export async function createLocalDb() {
  // Dynamic imports for better-sqlite3 (only used in Node.js dev)
  const { drizzle: drizzleSqlite } = await import('drizzle-orm/better-sqlite3');
  const Database = (await import('better-sqlite3')).default;
  const sqlite = new Database('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/db.sqlite');
  return drizzleSqlite(sqlite, { schema });
}

// Lazy-initialized db for local development
// Only initialize when accessed (used by seed scripts, Node.js dev server)
let _db: any = null;
export const db = new Proxy({} as any, {
  get(target, prop) {
    // Only initialize if we're actually in Node.js environment (not Workers)
    if (!_db && typeof __filename !== 'undefined') {
      throw new Error('Database not initialized. Call createLocalDb() first or use getDb() helper.');
    }
    return _db?.[prop];
  }
});

// Helper to get initialized db (for use in scripts)
export async function getDb() {
  if (!_db) {
    _db = await createLocalDb();
  }
  return _db;
}

