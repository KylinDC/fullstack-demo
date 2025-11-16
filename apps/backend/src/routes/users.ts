import { createDb, db as localDb, type Env } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';

const usersRoute = new Hono<{ Bindings: Env }>();

// Helper to get the correct db instance based on runtime
function getDb(c: any) {
  // In Cloudflare Workers, use the D1 binding
  if (c.env?.DB) {
    return createDb(c.env.DB);
  }
  // In local Node.js development, use the local db
  return localDb;
}

// GET /api/users - Get all users
usersRoute.get('/', async (c) => {
  try {
    const db = getDb(c);
    const allUsers = await db.select().from(users);
    return c.json({ success: true, data: allUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ success: false, error: 'Failed to fetch users' }, 500);
  }
});

// GET /api/users/:id - Get user by ID
usersRoute.get('/:id', async (c) => {
  try {
    const db = getDb(c);
    const id = Number.parseInt(c.req.param('id'));
    const user = await db.select().from(users).where(eq(users.id, id));

    if (user.length === 0) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    return c.json({ success: true, data: user[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.json({ success: false, error: 'Failed to fetch user' }, 500);
  }
});

// POST /api/users - Create a new user
usersRoute.post('/', async (c) => {
  try {
    const db = getDb(c);
    const body = await c.req.json();
    const { name, email } = body;

    if (!name || !email) {
      return c.json({ success: false, error: 'Name and email are required' }, 400);
    }

    const newUser = await db.insert(users).values({ name, email }).returning();
    return c.json({ success: true, data: newUser[0] }, 201);
  } catch (error) {
    console.error('Error creating user:', error);
    return c.json({ success: false, error: 'Failed to create user' }, 500);
  }
});

export default usersRoute;
