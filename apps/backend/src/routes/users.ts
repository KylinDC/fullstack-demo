import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';

const usersRoute = new Hono();

// GET /api/users - Get all users
usersRoute.get('/', async (c) => {
  try {
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

export default usersRoute;
