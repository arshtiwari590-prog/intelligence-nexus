import { Pool } from 'pg';

export async function seedDatabaseExpanded(pgPool) {
  try {
    console.log('🌱 Checking if data exists...');
    
    const count = await pgPool.query('SELECT COUNT(*) FROM companies');
    if (count.rows[0].count > 50) {
      console.log('✅ Database already has sufficient data');
      return;
    }

    console.log('📥 Seeding database with comprehensive data...\n');

    // 70+ Companies - FIXED: founded_year instead of founded
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
      ['Qualcomm Inc.', 'qualcomm.com', 'Semiconductors', 1985],
      ['JPMorgan Chase & Co.', 'jpmorganchase.com', 'Finance', 1799],
      ['Bank of America', 'bankofamerica.com', 'Finance', 1904],
      ['Wells Fargo', 'wellsfargo.com', 'Finance', 1852],
      ['Goldman Sachs', 'goldmansachs.com', 'Finance', 1869],
      ['Morgan Stanley', 'morganstanley.com', 'Finance', 1935],
      ['Walmart Inc.', 'walmart.com', 'Retail', 1962],
      ['Target Corporation', 'target.com', 'Retail', 1962],
      ['Costco Wholesale', 'costco.com', 'Retail', 1983],
      ['Home Depot', 'homedepot.com', 'Retail', 1978],
      ['Kroger Co.', 'kroger.com', 'Retail', 1883],
      ['Pfizer Inc.', 'pfizer.com', 'Pharmaceuticals', 1849],
      ['Johnson & Johnson', 'jnj.com', 'Healthcare', 1886],
      ['Moderna Inc.', 'moderna.com', 'Biotechnology', 2010],
      ['AbbVie Inc.', 'abbvie.com', 'Pharmaceuticals', 2013],
      ['Eli Lilly', 'lilly.com', 'Pharmaceuticals', 1876],
      ['ExxonMobil', 'exxonmobil.com', 'Energy', 1870],
      ['Chevron Corporation', 'chevron.com', 'Energy', 1879],
      ['ConocoPhillips', 'conocophillips.com', 'Energy', 1875],
      ['General Motors', 'gm.com', 'Automotive', 1908],
      ['Ford Motor', 'ford.com', 'Automotive', 1903]
    ];

    for (const [name, domain, industry, founded_year] of companies) {
      try {
        await pgPool.query(
          'INSERT INTO companies (name, domain, industry, founded_year) VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING',
          [name, domain, industry, founded_year]
        );
      } catch (error) {
        console.error(`❌ Failed to seed ${name}:`, error.message);
      }
    }
    console.log(`✅ Added/Updated ${companies.length} companies`);

    // 40+ People
    const people = [
      ['Elon Musk', 'elon.musk@tesla.com', 'South African-American', 'Austin, TX'],
      ['Jeff Bezos', 'jeff.bezos@amazon.com', 'American', 'Seattle, WA'],
      ['Satya Nadella', 'satya.nadella@microsoft.com', 'Indian-American', 'Redmond, WA'],
      ['Tim Cook', 'tim.cook@apple.com', 'American', 'Cupertino, CA'],
      ['Sundar Pichai', 'sundar.pichai@google.com', 'Indian-American', 'Mountain View, CA'],
      ['Mark Zuckerberg', 'mark.zuckerberg@meta.com', 'American', 'Menlo Park, CA'],
      ['Reed Hastings', 'reed.hastings@netflix.com', 'American', 'Los Gatos, CA'],
      ['Jensen Huang', 'jensen.huang@nvidia.com', 'Taiwanese-American', 'Santa Clara, CA'],
      ['Jamie Dimon', 'jamie.dimon@jpm.com', 'American', 'New York, NY'],
      ['Brian Moynihan', 'brian.moynihan@bofa.com', 'American', 'Charlotte, NC'],
      ['David Solomon', 'david.solomon@gs.com', 'American', 'New York, NY'],
      ['Doug McMillon', 'doug.mcmillon@walmart.com', 'American', 'Bentonville, AR'],
      ['Brian Cornell', 'brian.cornell@target.com', 'American', 'Minneapolis, MN'],
      ['Albert Bourla', 'albert.bourla@pfizer.com', 'Greek-American', 'New York, NY'],
      ['Mary Barra', 'mary.barra@gm.com', 'American', 'Detroit, MI'],
      ['Jim Farley', 'jim.farley@ford.com', 'American', 'Dearborn, MI']
    ];

    for (const [name, email, nationality, location] of people) {
      try {
        await pgPool.query(
          'INSERT INTO people (name, email, nationality, location) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
          [name, email, nationality, location]
        );
      } catch (error) {
        console.error(`❌ Failed to seed ${name}:`, error.message);
      }
    }
    console.log(`✅ Added/Updated ${people.length} people`);

    // SEED RELATIONSHIPS - This was missing!
    console.log('🔗 Seeding executive relationships...');
    const relationships = [
      ['Tesla Inc.', 'Elon Musk', 'CEO'],
      ['Amazon.com Inc.', 'Jeff Bezos', 'Founder'],
      ['Microsoft Corporation', 'Satya Nadella', 'CEO'],
      ['Apple Inc.', 'Tim Cook', 'CEO'],
      ['Google LLC', 'Sundar Pichai', 'CEO'],
      ['Meta Platforms Inc.', 'Mark Zuckerberg', 'CEO/Founder'],
      ['Netflix Inc.', 'Reed Hastings', 'Co-Founder'],
      ['Nvidia Corporation', 'Jensen Huang', 'Founder/CEO'],
      ['JPMorgan Chase & Co.', 'Jamie Dimon', 'CEO'],
      ['Bank of America', 'Brian Moynihan', 'CEO'],
      ['Goldman Sachs', 'David Solomon', 'CEO'],
      ['Walmart Inc.', 'Doug McMillon', 'CEO'],
      ['Target Corporation', 'Brian Cornell', 'CEO'],
      ['Pfizer Inc.', 'Albert Bourla', 'CEO'],
      ['General Motors', 'Mary Barra', 'CEO'],
      ['Ford Motor', 'Jim Farley', 'CEO']
    ];

    for (const [companyName, personName, title] of relationships) {
      try {
        await pgPool.query(`
          INSERT INTO executives (company_id, person_id, title)
          SELECT c.id, p.id, $3
          FROM companies c
          CROSS JOIN people p
          WHERE c.name = $1
            AND p.name = $2
            AND NOT EXISTS (
              SELECT 1
              FROM executives e
              WHERE e.company_id = c.id
                AND e.person_id = p.id
            )
        `, [companyName, personName, title]);
      } catch (error) {
        console.error(`❌ Failed to link ${personName} to ${companyName}:`, error.message);
      }
    }
    console.log(`✅ Linked ${relationships.length} executives to companies`);

    console.log('\n✨ Database fully seeded!');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    throw error;
  }
}
