import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { runMigrations } from './db/migrate.js';
import { seedDatabase } from './db/seed.js';
import { verifyDatabase } from './db/verify.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

// PostgreSQL connection with SSL for Render
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Search API - relationship-aware
app.post('/api/osint/search', async (req, res) => {
  try {
    const { query, type, limit = 50 } = req.body;
    if (!query) return res.status(400).json({ error: 'Query required' });

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
        return res.status(500).json({ error: 'People search failed', details: e.message });
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
        return res.status(500).json({ error: 'Companies search failed', details: e.message });
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
    res.json({ person: person.rows[0] });
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
    res.json({ company: company.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create case
app.post('/api/osint/case', async (req, res) => {
  try {
    const { title, description } = req.body;
    const caseId = uuidv4();
    await pgPool.query('INSERT INTO cases (id, title, description) VALUES ($1, $2, $3)', [caseId, title, description]);
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

// Startup with proper sequence
async function start() {
  try {
    console.log('🚀 Intelligence Nexus starting...\n');

    // Step 1: Migrations
    console.log('1️⃣  Running migrations...');
    await runMigrations(pgPool);

    // Step 2: Seed
    console.log('\n2️⃣  Seeding database...');
    await seedDatabase(pgPool);

    // Step 3: Verify
    console.log('\n3️⃣  Verifying invariants...');
    await verifyDatabase(pgPool);

    // Step 4: Start server
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
      console.log(`\n✅ Intelligence Nexus API running on port ${PORT}`);
      console.log(`🔗 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`📊 Database: Connected with SSL/TLS\n`);
    });

  } catch (error) {
    console.error('\n💥 FATAL STARTUP ERROR:', error.message);
    console.error(error.stack);
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
