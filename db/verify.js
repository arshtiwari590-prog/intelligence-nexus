export async function verifyDatabase(pgPool) {
  try {
    console.log('🔍 Verifying database invariants...');

    const checks = await Promise.all([
      pgPool.query('SELECT COUNT(*)::int AS count FROM companies'),
      pgPool.query('SELECT COUNT(*)::int AS count FROM people'),
      pgPool.query('SELECT COUNT(*)::int AS count FROM executives'),
      pgPool.query(`SELECT COUNT(*)::int AS count FROM companies WHERE name = 'Tesla Inc.'`),
      pgPool.query(`SELECT COUNT(*)::int AS count FROM people WHERE name = 'Elon Musk'`),
      pgPool.query(`
        SELECT COUNT(*)::int AS count FROM executives e
        JOIN companies c ON c.id = e.company_id
        JOIN people p ON p.id = e.person_id
        WHERE c.name = 'Tesla Inc.' AND p.name = 'Elon Musk'
      `)
    ]);

    const [companies, people, executives, tesla, elon, teslaElon] = checks.map(r => r.rows[0].count);

    console.log(`📊 Database stats: ${companies} companies, ${people} people, ${executives} executives`);

    const failures = [];

    if (companies <= 0) failures.push('companies table is empty');
    if (people <= 0) failures.push('people table is empty');
    if (executives <= 0) failures.push('executives table is empty');
    if (tesla !== 1) failures.push(`Tesla Inc. found ${tesla} times (expected 1)`);
    if (elon !== 1) failures.push(`Elon Musk found ${elon} times (expected 1)`);
    if (teslaElon !== 1) failures.push(`Tesla ↔ Elon relationship found ${teslaElon} times (expected 1)`);

    if (failures.length > 0) {
      throw new Error(`Database invariants failed:\n- ${failures.join('\n- ')}`);
    }

    console.log('✅ All database invariants verified');
    return true;

  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    throw error;
  }
}
