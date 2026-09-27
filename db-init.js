import { createReadStream } from 'fs';
import { readline } from 'readline';

export async function initializeDatabase(pgPool) {
  try {
    console.log('🔧 Checking database schema...');

    // Check if companies table exists
    const tableCheck = await pgPool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'companies'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('📋 Creating schema from schema.sql...');
      
      // Read and execute schema.sql
      const schema = `
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        
        CREATE TABLE IF NOT EXISTS companies (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL UNIQUE,
          domain VARCHAR(255),
          industry VARCHAR(255),
          founded_year INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS people (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE,
          phone VARCHAR(20),
          nationality VARCHAR(255),
          location VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS executives (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          company_id UUID REFERENCES companies(id),
          person_id UUID REFERENCES people(id),
          title VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS cases (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS breaches (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email VARCHAR(255),
          phone VARCHAR(20),
          source VARCHAR(255),
          breach_date DATE,
          severity VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      // Execute schema
      const statements = schema.split(';').filter(s => s.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await pgPool.query(statement);
          } catch (e) {
            if (!e.message.includes('already exists')) {
              console.error('Schema statement failed:', e.message);
            }
          }
        }
      }
      
      console.log('✅ Schema created');
    } else {
      console.log('✅ Schema already exists');
    }

    // Ensure UNIQUE constraints exist
    try {
      await pgPool.query(`
        ALTER TABLE companies
        ADD CONSTRAINT companies_name_unique UNIQUE (name)
      `);
    } catch (e) {
      if (!e.message.includes('already exists')) {
        console.log('ℹ️  companies.name unique constraint already exists');
      }
    }

    try {
      await pgPool.query(`
        ALTER TABLE people
        ADD CONSTRAINT people_email_unique UNIQUE (email)
      `);
    } catch (e) {
      if (!e.message.includes('already exists')) {
        console.log('ℹ️  people.email unique constraint already exists');
      }
    }

    return true;

  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    return false;
  }
}

export async function verifyDatabase(pgPool) {
  try {
    const result = await pgPool.query('SELECT COUNT(*) FROM companies');
    console.log('✅ Database verified and accessible');
    return true;
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    return false;
  }
}
