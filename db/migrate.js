import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations(pgPool) {
  try {
    console.log('🔄 Running database migrations...');

    // Create migrations table if it doesn't exist
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Read migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`📋 Found ${files.length} migration files`);

    // Get already-applied migrations
    const applied = await pgPool.query(`
      SELECT version FROM schema_migrations ORDER BY version
    `);
    const appliedVersions = new Set(applied.rows.map(r => r.version));

    // Run unapplied migrations
    for (const file of files) {
      const match = file.match(/^(\d+)_/);
      if (!match) continue;

      const version = parseInt(match[1], 10);
      if (appliedVersions.has(version)) {
        console.log(`✅ Migration ${version} already applied`);
        continue;
      }

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      const client = await pgPool.connect();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (version, name) VALUES ($1, $2)',
          [version, file]
        );
        await client.query('COMMIT');
        console.log(`✅ Applied migration ${version}: ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Migration ${version} failed: ${error.message}`);
      } finally {
        client.release();
      }
    }

    console.log('✅ All migrations completed');
    return true;

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}
