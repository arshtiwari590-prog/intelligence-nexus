import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function initializeDatabase(pgPool) {
  try {
    console.log('🗄️  Checking database schema...');
    
    // Check if tables exist
    const result = await pgPool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'people'
      )
    `);
    
    if (result.rows[0].exists) {
      console.log('✅ Database tables already exist');
      return true;
    }
    
    console.log('⚠️  Database tables missing. Initializing schema...');
    
    // Read schema.sql
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Execute schema
    await pgPool.query(schema);
    
    console.log('✅ Database schema initialized successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    
    // If it's just a missing extension error, try continuing
    if (error.message.includes('extension')) {
      console.log('⚠️  Some extensions not available, continuing anyway...');
      return true;
    }
    
    return false;
  }
}

export async function verifyDatabase(pgPool) {
  try {
    // Test connection
    const result = await pgPool.query('SELECT NOW()');
    console.log('✅ Database connection verified');
    
    // Count tables
    const tableResult = await pgPool.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log(`✅ Database has ${tableResult.rows[0].table_count} tables`);
    return true;
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    return false;
  }
}
