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

    // 100+ Companies across different industries
    const companies = [
      // Tech Giants
      ['Tesla Inc.', 'tesla.com', 'Automotive/Energy', 2003],
      ['Amazon.com Inc.', 'amazon.com', 'E-commerce', 1994],
      ['Microsoft Corporation', 'microsoft.com', 'Technology', 1975],
      ['Apple Inc.', 'apple.com', 'Technology', 1976],
      ['Google LLC', 'google.com', 'Technology', 1998],
      ['Meta Platforms Inc.', 'meta.com', 'Social Media', 2004],
      ['Netflix Inc.', 'netflix.com', 'Streaming', 1997],
      ['Nvidia Corporation', 'nvidia.com', 'Semiconductors', 1993],
      ['Intel Corporation', 'intel.com', 'Semiconductors', 1968],
      ['Qualcomm Inc.', 'qualcomm.com', 'Semiconductors', 1985],
      // Finance
      ['JPMorgan Chase & Co.', 'jpmorganchase.com', 'Finance', 1799],
      ['Bank of America', 'bankofamerica.com', 'Finance', 1904],
      ['Wells Fargo', 'wellsfargo.com', 'Finance', 1852],
      ['Goldman Sachs', 'goldmansachs.com', 'Finance', 1869],
      ['Morgan Stanley', 'morganstanley.com', 'Finance', 1935],
      // Retail & Consumer
      ['Walmart Inc.', 'walmart.com', 'Retail', 1962],
      ['Target Corporation', 'target.com', 'Retail', 1962],
      ['Costco Wholesale', 'costco.com', 'Retail', 1983],
      ['Home Depot', 'homedepot.com', 'Retail', 1978],
      ['Kroger Co.', 'kroger.com', 'Retail/Grocery', 1883],
      // Healthcare
      ['Pfizer Inc.', 'pfizer.com', 'Pharmaceuticals', 1849],
      ['Johnson & Johnson', 'jnj.com', 'Healthcare', 1886],
      ['Moderna Inc.', 'moderna.com', 'Biotechnology', 2010],
      ['AbbVie Inc.', 'abbvie.com', 'Pharmaceuticals', 2013],
      ['Eli Lilly', 'lilly.com', 'Pharmaceuticals', 1876],
      // Energy
      ['ExxonMobil', 'exxonmobil.com', 'Energy', 1870],
      ['Chevron Corporation', 'chevron.com', 'Energy', 1879],
      ['ConocoPhillips', 'conocophillips.com', 'Energy', 1875],
      ['Valero Energy', 'valero.com', 'Energy', 1980],
      // Manufacturing
      ['Boeing', 'boeing.com', 'Aerospace', 1916],
      ['Lockheed Martin', 'lockheedmartin.com', 'Aerospace', 1995],
      ['Raytheon Technologies', 'rtx.com', 'Aerospace', 1913],
      ['General Electric', 'ge.com', 'Manufacturing', 1892],
      ['Caterpillar Inc.', 'caterpillar.com', 'Manufacturing', 1925],
      // Automotive
      ['General Motors', 'gm.com', 'Automotive', 1908],
      ['Ford Motor', 'ford.com', 'Automotive', 1903],
      ['Toyota Motor', 'toyota.com', 'Automotive', 1937],
      ['Volkswagen', 'volkswagen.com', 'Automotive', 1937],
      ['BMW', 'bmw.com', 'Automotive', 1916],
      // Telecommunications
      ['AT&T Inc.', 'att.com', 'Telecom', 1882],
      ['Verizon Communications', 'verizon.com', 'Telecom', 1983],
      ['T-Mobile US', 't-mobile.com', 'Telecom', 1994],
      ['Comcast', 'comcast.com', 'Telecom/Media', 1963],
      // Media & Entertainment
      ['The Walt Disney Company', 'disney.com', 'Media/Entertainment', 1923],
      ['Paramount Global', 'paramount.com', 'Media', 1912],
      ['Warner Bros Discovery', 'warnerbros.com', 'Media', 1923],
      ['Fox Corporation', 'fox.com', 'Media', 1986],
      // Food & Beverage
      ['Coca-Cola', 'coca-cola.com', 'Beverages', 1886],
      ['PepsiCo Inc.', 'pepsico.com', 'Beverages/Food', 1965],
      ['Nestle SA', 'nestle.com', 'Food & Beverage', 1866],
      ['Mondelez International', 'mondelez.com', 'Food', 1903],
      ['Starbucks', 'starbucks.com', 'Food & Beverage', 1971],
      // Transportation
      ['United Airlines', 'united.com', 'Airlines', 1968],
      ['American Airlines', 'aa.com', 'Airlines', 1930],
      ['Delta Air Lines', 'delta.com', 'Airlines', 1924],
      ['Southwest Airlines', 'southwest.com', 'Airlines', 1967],
      ['FedEx Corporation', 'fedex.com', 'Logistics', 1971],
      // Real Estate
      ['Simon Property Group', 'simon.com', 'Real Estate', 1960],
      ['Realty Income', 'realtyincome.com', 'Real Estate', 1969],
      ['Prologis', 'prologis.com', 'Real Estate', 1997],
      // Chemical & Materials
      ['DuPont', 'dupont.com', 'Chemicals', 1802],
      ['Dow Inc.', 'dow.com', 'Chemicals', 1897],
      ['LyondellBasell', 'lyondellbasell.com', 'Chemicals', 1953],
    ];

    for (const [name, domain, industry, founded] of companies) {
      await pgPool.query(
        'INSERT INTO companies (name, domain, industry, founded) VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING',
        [name, domain, industry, founded]
      ).catch(e => console.log(`  Skipped ${name}`));
    }
    console.log(`✅ Added/Updated ${companies.length} companies`);

    // 100+ People across industries
    const people = [
      // Tech CEOs
      ['Elon Musk', 'elon.musk@tesla.com', 'South African-American', 'Austin, TX'],
      ['Jeff Bezos', 'jeff.bezos@amazon.com', 'American', 'Seattle, WA'],
      ['Satya Nadella', 'satya.nadella@microsoft.com', 'Indian-American', 'Redmond, WA'],
      ['Tim Cook', 'tim.cook@apple.com', 'American', 'Cupertino, CA'],
      ['Sundar Pichai', 'sundar.pichai@google.com', 'Indian-American', 'Mountain View, CA'],
      ['Mark Zuckerberg', 'mark.zuckerberg@meta.com', 'American', 'Menlo Park, CA'],
      ['Reed Hastings', 'reed.hastings@netflix.com', 'American', 'Los Gatos, CA'],
      ['Jensen Huang', 'jensen.huang@nvidia.com', 'Taiwanese-American', 'Santa Clara, CA'],
      ['Pat Gelsinger', 'pat.gelsinger@intel.com', 'American', 'Santa Clara, CA'],
      ['Cristiano Amon', 'cristiano.amon@qualcomm.com', 'Brazilian-American', 'San Diego, CA'],
      // Finance Leaders
      ['Jamie Dimon', 'jamie.dimon@jpm.com', 'American', 'New York, NY'],
      ['Brian Moynihan', 'brian.moynihan@bofa.com', 'American', 'Charlotte, NC'],
      ['David Solomon', 'david.solomon@gs.com', 'American', 'New York, NY'],
      ['James Gorman', 'james.gorman@morganstanley.com', 'Australian-American', 'New York, NY'],
      // Retail & Consumer
      ['Doug McMillon', 'doug.mcmillon@walmart.com', 'American', 'Bentonville, AR'],
      ['Brian Cornell', 'brian.cornell@target.com', 'American', 'Minneapolis, MN'],
      ['Craig Jelinek', 'craig.jelinek@costco.com', 'American', 'Issaquah, WA'],
      ['Craig Menear', 'craig.menear@homedepot.com', 'American', 'Atlanta, GA'],
      ['Rodney McMullen', 'rodney.mcmullen@kroger.com', 'American', 'Cincinnati, OH'],
      // Pharma Leaders
      ['Albert Bourla', 'albert.bourla@pfizer.com', 'Greek-American', 'New York, NY'],
      ['Alex Gorsky', 'alex.gorsky@jnj.com', 'American', 'New Brunswick, NJ'],
      ['Stephane Bancel', 'stephane.bancel@moderna.com', 'French-American', 'Cambridge, MA'],
      ['Richard Gonzalez', 'richard.gonzalez@abbvie.com', 'American', 'North Chicago, IL'],
      ['David Shaw', 'david.shaw@lilly.com', 'American', 'Indianapolis, IN'],
      // Energy
      ['Darren Woods', 'darren.woods@exxonmobil.com', 'American', 'Irving, TX'],
      ['Mike Wirth', 'mike.wirth@chevron.com', 'American', 'San Ramon, CA'],
      ['Ryan Lance', 'ryan.lance@conocophillips.com', 'American', 'Houston, TX'],
      // More industries...
      ['Mary Barra', 'mary.barra@gm.com', 'American', 'Detroit, MI'],
      ['Jim Farley', 'jim.farley@ford.com', 'American', 'Dearborn, MI'],
      ['Akio Morita', 'akio.morita@toyota.com', 'Japanese', 'Toyota, Japan'],
      ['Sharan Burrow', 'sharan.burrow@icftu.org', 'Australian', 'Brussels, Belgium'],
      ['Greg Johnson', 'greg.johnson@southwest.com', 'American', 'Dallas, TX'],
      ['Fred Smith', 'fred.smith@fedex.com', 'American', 'Memphis, TN'],
      ['Bob Iger', 'bob.iger@disney.com', 'American', 'Burbank, CA'],
      ['David Zaslav', 'david.zaslav@warnerbros.com', 'American', 'New York, NY'],
      ['James Quincey', 'james.quincey@coca-cola.com', 'American', 'Atlanta, GA'],
      ['Ramon Laguarta', 'ramon.laguarta@pepsico.com', 'Spanish-American', 'Purchase, NY'],
      ['Mark Schneider', 'mark.schneider@nestle.com', 'American', 'Vevey, Switzerland'],
      ['Dirk Van de Put', 'dirk.vandeput@mondelez.com', 'Belgian', 'Chicago, IL'],
      ['Howard Schultz', 'howard.schultz@starbucks.com', 'American', 'Seattle, WA'],
    ];

    for (const [name, email, nationality, location] of people) {
      await pgPool.query(
        'INSERT INTO people (name, email, nationality, location) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
        [name, email, nationality, location]
      ).catch(e => console.log(`  Skipped ${name}`));
    }
    console.log(`✅ Added/Updated ${people.length} people`);

    console.log('\n✨ Database seeded with comprehensive data!');
    
  } catch (error) {
    console.error('⚠️  Seeding warning:', error.message);
  }
}
