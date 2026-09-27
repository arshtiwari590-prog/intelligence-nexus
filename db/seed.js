export async function seedDatabase(pgPool) {
  const client = await pgPool.connect();

  try {
    console.log('🌱 Starting seed transaction...');
    await client.query('BEGIN');

    // Check if already seeded
    const count = await client.query('SELECT COUNT(*) FROM companies');
    if (count.rows[0].count > 0) {
      console.log('✅ Database already seeded');
      await client.query('ROLLBACK');
      return;
    }

    // UPSERT Companies
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
      await client.query(
        `INSERT INTO companies (name, domain, industry, founded_year)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (name) DO UPDATE SET
           domain = EXCLUDED.domain,
           industry = EXCLUDED.industry,
           founded_year = EXCLUDED.founded_year`,
        [name, domain, industry, founded_year]
      );
    }
    console.log(`✅ Seeded ${companies.length} companies`);

    // UPSERT People
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
      await client.query(
        `INSERT INTO people (name, email, nationality, location)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           nationality = EXCLUDED.nationality,
           location = EXCLUDED.location`,
        [name, email, nationality, location]
      );
    }
    console.log(`✅ Seeded ${people.length} people`);

    // UPSERT Executives (relationships)
    const relationships = [
      ['Tesla Inc.', 'elon.musk@tesla.com', 'CEO'],
      ['Amazon.com Inc.', 'jeff.bezos@amazon.com', 'Founder'],
      ['Microsoft Corporation', 'satya.nadella@microsoft.com', 'CEO'],
      ['Apple Inc.', 'tim.cook@apple.com', 'CEO'],
      ['Google LLC', 'sundar.pichai@google.com', 'CEO'],
      ['Meta Platforms Inc.', 'mark.zuckerberg@meta.com', 'CEO/Founder'],
      ['Netflix Inc.', 'reed.hastings@netflix.com', 'Co-Founder'],
      ['Nvidia Corporation', 'jensen.huang@nvidia.com', 'Founder/CEO']
    ];

    for (const [companyName, personEmail, title] of relationships) {
      await client.query(
        `INSERT INTO executives (company_id, person_id, title)
         SELECT c.id, p.id, $3
         FROM companies c
         CROSS JOIN people p
         WHERE c.name = $1 AND p.email = $2
         ON CONFLICT (company_id, person_id) DO UPDATE SET
           title = EXCLUDED.title`,
        [companyName, personEmail, title]
      );
    }
    console.log(`✅ Linked ${relationships.length} executives to companies`);

    await client.query('COMMIT');
    console.log('✅ Seed transaction committed successfully');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed transaction rolled back:', error.message);
    throw error;
  } finally {
    client.release();
  }
}
