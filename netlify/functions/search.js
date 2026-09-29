import { Pool } from 'pg';
import dotenv from 'dotenv';
import { ensureDbInitialized } from './init-db.js';

dotenv.config();

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async (req, context) => {
  // Initialize database on first request
  await ensureDbInitialized();
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { query, type, limit = 50 } = JSON.parse(req.body);

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const results = { people: [], companies: [] };

    if (type === 'all' || type === 'people') {
      try {
        const r = await pgPool.query(`
          SELECT DISTINCT p.*
          FROM people p
          LEFT JOIN executives e ON e.person_id = p.id
          LEFT JOIN companies c ON c.id = e.company_id
          WHERE p.name ILIKE $1
             OR p.email ILIKE $1
             OR c.name ILIKE $1
          LIMIT $2
        `, [`%${query}%`, limit]);
        results.people = r.rows;
      } catch (e) {
        console.error('People search error:', e.message);
        return new Response(JSON.stringify({ error: 'People search failed', details: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (type === 'all' || type === 'companies') {
      try {
        const r = await pgPool.query(`
          SELECT DISTINCT c.*
          FROM companies c
          LEFT JOIN executives e ON e.company_id = c.id
          LEFT JOIN people p ON p.id = e.person_id
          WHERE c.name ILIKE $1
             OR c.domain ILIKE $1
             OR p.name ILIKE $1
          LIMIT $2
        `, [`%${query}%`, limit]);
        results.companies = r.rows;
      } catch (e) {
        console.error('Companies search error:', e.message);
        return new Response(JSON.stringify({ error: 'Companies search failed', details: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Search error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
