import { Pool } from 'pg';

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async (req, context) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const id = context.params.id;
    const company = await pgPool.query('SELECT * FROM companies WHERE id = $1', [id]);
    
    if (company.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ company: company.rows[0] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Company error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
