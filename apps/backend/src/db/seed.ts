import 'dotenv/config';
import { users } from '@/db/schema';
import { db } from '../db';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Insert sample users
    await db.insert(users).values([
      {
        name: 'John Doe',
        email: 'john@example.com',
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
      },
    ]);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
