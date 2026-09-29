import { Pool } from 'pg';
import { runMigrations } from '../../db/migrate.js';
import { seedDatabase } from '../../db/seed.js';
import { verifyDatabase } from '../../db/verify.js';

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

let initialized = false;

export async function ensureDbInitialized() {
  if (initialized) return;

  try {
    console.log('🚀 Initializing database...');
    await runMigrations(pgPool);
    await seedDatabase(pgPool);
    await verifyDatabase(pgPool);
    console.log('✅ Database initialized');
    initialized = true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}
