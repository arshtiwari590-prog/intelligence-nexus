import { Pool } from 'pg';

export async function seedDatabase(pgPool) {
  try {
    console.log('🌱 Checking if data exists...');
    
    const count = await pgPool.query('SELECT COUNT(*) FROM companies');
    if (count.rows[0].count > 0) {
      console.log('✅ Database already has data');
      return;
    }

    console.log('📥 Seeding database with sample data...\n');

    // Sample Companies - FIXED: founded_year instead of founded
    const companies = [
      ['Tesla Inc.', 'tesla.com', 'Automotive', 2003],
      ['Amazon.com Inc.', 'amazon.com', 'E-commerce', 1994],
      ['Microsoft Corporation', 'microsoft.com', 'Technology', 1975],
      ['Apple Inc.', 'apple.com', 'Technology', 1976],
      ['Google LLC', 'google.com', 'Technology', 1998],
      ['Meta Platforms Inc.', 'meta.com', 'Social Media', 2004],
      ['Netflix Inc.', 'netflix.com', 'Streaming', 1997],
      ['Nvidia Corporation', 'nvidia.com', 'Semiconductors', 1993],
      ['Intel Corporation', 'intel.com', 'Semiconductors', 1968],
      ['JPMorgan Chase & Co.', 'jpmorganchase.com', 'Finance', 1799]
    ];

    for (const [name, domain, industry, founded_year] of companies) {
      try {
        await pgPool.query(
          'INSERT INTO companies (name, domain, industry, founded_year) VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING',
          [name, domain, industry, founded_year]
        );
      } catch (error) {
        console.error(`❌ Failed to seed company ${name}:`, error.message);
        throw error;
      }
    }
    console.log(`✅ Added ${companies.length} companies`);

    // Sample People
    const people = [
      ['Elon Musk', 'elon.musk@tesla.com', 'South African-American', 'Austin, TX'],
      ['Jeff Bezos', 'jeff.bezos@amazon.com', 'American', 'Seattle, WA'],
      ['Satya Nadella', 'satya.nadella@microsoft.com', 'Indian-American', 'Redmond, WA'],
      ['Tim Cook', 'tim.cook@apple.com', 'American', 'Cupertino, CA'],
      ['Sundar Pichai', 'sundar.pichai@google.com', 'Indian-American', 'Mountain View, CA'],
      ['Mark Zuckerberg', 'mark.zuckerberg@meta.com', 'American', 'Menlo Park, CA'],
      ['Reed Hastings', 'reed.hastings@netflix.com', 'American', 'Los Gatos, CA'],
      ['Jensen Huang', 'jensen.huang@nvidia.com', 'Taiwanese-American', 'Santa Clara, CA']
    ];

    for (const [name, email, nationality, location] of people) {
      try {
        await pgPool.query(
          'INSERT INTO people (name, email, nationality, location) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
          [name, email, nationality, location]
        );
      } catch (error) {
        console.error(`❌ Failed to seed person ${name}:`, error.message);
        throw error;
      }
    }
    console.log(`✅ Added ${people.length} people`);

    console.log('\n✨ Database seeded with sample data!');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    throw error;
  }
}
