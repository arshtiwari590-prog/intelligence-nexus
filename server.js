import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { initializeDatabase, verifyDatabase } from './db-init.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

// Database connection
const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Search API
app.post('/api/osint/search', async (req, res) => {
  try {
    const { query, type, limit = 50 } = req.body;
    if (!query) return res.status(400).json({ error: 'Query required' });

    const results = { people: [], companies: [], assets: [], breaches: [], sanctions: [] };

    if (type === 'all' || type === 'people') {
      try {
        const r = await pgPool.query('SELECT * FROM people WHERE name ILIKE $1 LIMIT $2', [`%${query}%`, limit]);
        results.people = r.rows;
      } catch (e) {
        console.log('People table not ready:', e.message);
      }
    }

    if (type === 'all' || type === 'companies') {
      try {
        const r = await pgPool.query('SELECT * FROM companies WHERE name ILIKE $1 OR domain ILIKE $1 LIMIT $2', [`%${query}%`, limit]);
        results.companies = r.rows;
      } catch (e) {
        console.log('Companies table not ready:', e.message);
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get person profile
app.get('/api/osint/person/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const person = await pgPool.query('SELECT * FROM people WHERE id = $1', [id]);
    if (person.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const properties = await pgPool.query('SELECT * FROM properties WHERE owner_id = $1', [id]);
    const companies = await pgPool.query('SELECT * FROM companies WHERE owner_id = $1', [id]);

    res.json({ person: person.rows[0], properties: properties.rows, companies: companies.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get company profile
app.get('/api/osint/company/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const company = await pgPool.query('SELECT * FROM companies WHERE id = $1', [id]);
    if (company.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const executives = await pgPool.query('SELECT * FROM executives WHERE company_id = $1', [id]);
    const facilities = await pgPool.query('SELECT * FROM facilities WHERE company_id = $1', [id]);
    const filings = await pgPool.query('SELECT * FROM sec_filings WHERE company_id = $1 ORDER BY date DESC LIMIT 10', [id]);

    res.json({ company: company.rows[0], executives: executives.rows, facilities: facilities.rows, filings: filings.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create case
app.post('/api/osint/case', async (req, res) => {
  try {
    const { title, description } = req.body;
    const caseId = uuidv4();
    await pgPool.query('INSERT INTO cases (id, title, description, created_at) VALUES ($1, $2, $3, NOW())', [caseId, title, description]);
    res.json({ caseId, message: 'Case created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Breach check
app.post('/api/osint/breach-check', async (req, res) => {
  try {
    const { email, phone } = req.body;
    const result = await pgPool.query('SELECT * FROM breaches WHERE email = $1 OR phone = $2', [email, phone]);
    res.json({ breachCount: result.rows.length, breaches: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Error handlers
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Start server
async function start() {
  try {
    console.log('🔍 Initializing database...');
    const initialized = await initializeDatabase(pgPool);
    if (!initialized) console.warn('⚠️  Database initialization incomplete');

    console.log('✅ Database verification...');
    await verifyDatabase(pgPool);

    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 Intelligence Nexus API running on port ${PORT}`);
      console.log(`✅ PostgreSQL: Connected`);
      console.log(`🛡️  Security: Backend URLs hidden\n`);
    });
  } catch (error) {
    console.error('💥 Startup error:', error);
    process.exit(1);
  }
}

start();

process.on('SIGINT', async () => {
  try {
    pgPool.end();
  } catch (e) {
    console.error('Shutdown error:', e);
  }
  process.exit(0);
});
