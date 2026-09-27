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
      console.log('📋 Creating schema...');
      
      const schema = `
        CREATE TABLE IF NOT EXISTS companies (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL UNIQUE,
          domain VARCHAR(255),
          industry VARCHAR(255),
          founded_year INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS people (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE,
          phone VARCHAR(20),
          nationality VARCHAR(255),
          location VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS executives (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
          title VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT executives_company_person_unique UNIQUE (company_id, person_id)
        );
        
        CREATE TABLE IF NOT EXISTS cases (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS breaches (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255),
          phone VARCHAR(20),
          source VARCHAR(255),
          breach_date DATE,
          severity VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

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
        console.log('ℹ️  companies.name constraint exists');
      }
    }

    try {
      await pgPool.query(`
        ALTER TABLE people
        ADD CONSTRAINT people_email_unique UNIQUE (email)
      `);
    } catch (e) {
      if (!e.message.includes('already exists')) {
        console.log('ℹ️  people.email constraint exists');
      }
    }

    try {
      await pgPool.query(`
        ALTER TABLE executives
        ADD CONSTRAINT executives_company_person_unique UNIQUE (company_id, person_id)
      `);
    } catch (e) {
      if (!e.message.includes('already exists')) {
        console.log('ℹ️  executives uniqueness constraint exists');
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
