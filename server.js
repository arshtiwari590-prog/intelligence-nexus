import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import neo4j from 'neo4j-driver';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database Connections
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URI || 'neo4j://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'password'
  )
);

// ============= OSINT API ROUTES =============

// Search across all data sources
app.post('/api/osint/search', async (req, res) => {
  const { query, type, limit = 50 } = req.body;
  
  try {
    const results = {
      people: [],
      companies: [],
      assets: [],
      locations: [],
      breaches: [],
      sanctions: [],
      relationships: []
    };

    // Query PostgreSQL for structured data
    if (type === 'all' || type === 'people') {
      const peopleResult = await pgPool.query(
        'SELECT * FROM people WHERE name ILIKE $1 OR email ILIKE $1 LIMIT $2',
        [`%${query}%`, limit]
      );
      results.people = peopleResult.rows;
    }

    if (type === 'all' || type === 'companies') {
      const companiesResult = await pgPool.query(
        'SELECT * FROM companies WHERE name ILIKE $1 OR domain ILIKE $1 LIMIT $2',
        [`%${query}%`, limit]
      );
      results.companies = companiesResult.rows;
    }

    // Query Neo4j for relationships
    const session = neo4jDriver.session();
    const relResult = await session.run(
      'MATCH (n) WHERE n.name =~ $search RETURN n LIMIT $limit',
      { search: `(?i).*${query}.*`, limit: limit }
    );
    results.relationships = relResult.records.map(r => r.get(0).properties);
    await session.close();

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get person profile with relationships
app.get('/api/osint/person/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get person data
    const personResult = await pgPool.query(
      'SELECT * FROM people WHERE id = $1',
      [id]
    );
    
    if (personResult.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    const person = personResult.rows[0];

    // Get associated properties
    const propertiesResult = await pgPool.query(
      'SELECT * FROM properties WHERE owner_id = $1',
      [id]
    );

    // Get associated companies
    const companiesResult = await pgPool.query(
      'SELECT * FROM companies WHERE owner_id = $1',
      [id]
    );

    // Get graph relationships
    const session = neo4jDriver.session();
    const relResult = await session.run(
      'MATCH (p:Person {id: $id})-[r]-(connected) RETURN p, r, connected',
      { id }
    );
    
    const relationships = relResult.records.map(r => ({
      person: r.get(0).properties,
      relationship: r.get(1).type,
      connected: r.get(2).properties
    }));
    await session.close();

    res.json({
      person,
      properties: propertiesResult.rows,
      companies: companiesResult.rows,
      relationships
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get company profile with supply chain
app.get('/api/osint/company/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const companyResult = await pgPool.query(
      'SELECT * FROM companies WHERE id = $1',
      [id]
    );

    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = companyResult.rows[0];

    // Get executives
    const execResult = await pgPool.query(
      'SELECT * FROM executives WHERE company_id = $1',
      [id]
    );

    // Get properties/facilities
    const facilitiesResult = await pgPool.query(
      'SELECT * FROM facilities WHERE company_id = $1',
      [id]
    );

    // Get SEC filings
    const filingsResult = await pgPool.query(
      'SELECT * FROM sec_filings WHERE company_id = $1 ORDER BY date DESC LIMIT 10',
      [id]
    );

    // Get supply chain
    const session = neo4jDriver.session();
    const supplyResult = await session.run(
      'MATCH (c:Company {id: $id})-[r:SUPPLIES|SUPPLIES_TO]-(partner) RETURN c, r, partner',
      { id }
    );

    const supplyChain = supplyResult.records.map(r => ({
      type: r.get(1).type,
      company: r.get(0).properties,
      partner: r.get(2).properties
    }));
    await session.close();

    res.json({
      company,
      executives: execResult.rows,
      facilities: facilitiesResult.rows,
      filings: filingsResult.rows,
      supplyChain
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Geospatial search - entities at location
app.get('/api/osint/geo/:latitude/:longitude/:radius', async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.params;

    const result = await pgPool.query(
      `SELECT * FROM facilities 
       WHERE ST_DWithin(
         ST_MakePoint(longitude, latitude)::geography,
         ST_MakePoint($1, $2)::geography,
         $3
       )`,
      [longitude, latitude, radius * 1000] // Convert km to meters
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Real-time feeds (aircraft, ships, satellites)
app.get('/api/osint/feeds/aircraft', async (req, res) => {
  try {
    const result = await pgPool.query(
      'SELECT * FROM live_aircraft ORDER BY last_updated DESC LIMIT 1000'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/osint/feeds/vessels', async (req, res) => {
  try {
    const result = await pgPool.query(
      'SELECT * FROM live_vessels ORDER BY last_updated DESC LIMIT 1000'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Breach monitoring - check if email/phone in breaches
app.post('/api/osint/breach-check', async (req, res) => {
  try {
    const { email, phone } = req.body;

    const result = await pgPool.query(
      `SELECT * FROM breaches 
       WHERE email = $1 OR phone = $2`,
      [email, phone]
    );

    res.json({
      breachCount: result.rows.length,
      breaches: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create investigation case
app.post('/api/osint/case', async (req, res) => {
  try {
    const { title, description, entities } = req.body;
    const caseId = uuidv4();

    await pgPool.query(
      `INSERT INTO cases (id, title, description, created_at) 
       VALUES ($1, $2, $3, NOW())`,
      [caseId, title, description]
    );

    res.json({ caseId, message: 'Case created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get case with all entities
app.get('/api/osint/case/:caseId', async (req, res) => {
  try {
    const { caseId } = req.params;

    const caseResult = await pgPool.query(
      'SELECT * FROM cases WHERE id = $1',
      [caseId]
    );

    if (caseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const entitiesResult = await pgPool.query(
      'SELECT * FROM case_entities WHERE case_id = $1',
      [caseId]
    );

    res.json({
      case: caseResult.rows[0],
      entities: entitiesResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Relationship graph visualization
app.get('/api/osint/graph/:entityId', async (req, res) => {
  try {
    const { entityId } = req.params;
    const session = neo4jDriver.session();

    const result = await session.run(
      `MATCH (n {id: $id})-[r*1..3]-(m)
       RETURN n, collect({rel: r, node: m}) as connections`,
      { id: entityId }
    );

    const nodes = [];
    const edges = [];

    result.records.forEach(record => {
      const mainNode = record.get(0);
      nodes.push({
        id: mainNode.properties.id,
        label: mainNode.properties.name,
        type: mainNode.labels[0]
      });

      const connections = record.get(1);
      connections.forEach(conn => {
        const connNode = conn.node;
        nodes.push({
          id: connNode.properties.id,
          label: connNode.properties.name,
          type: connNode.labels[0]
        });

        edges.push({
          source: mainNode.properties.id,
          target: connNode.properties.id,
          type: conn.rel.type
        });
      });
    });

    await session.close();

    res.json({ nodes, edges });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export case as report
app.get('/api/osint/case/:caseId/export', async (req, res) => {
  try {
    const { caseId } = req.params;

    const caseResult = await pgPool.query(
      'SELECT * FROM cases WHERE id = $1',
      [caseId]
    );

    const entitiesResult = await pgPool.query(
      'SELECT * FROM case_entities WHERE case_id = $1',
      [caseId]
    );

    const report = {
      title: caseResult.rows[0].title,
      description: caseResult.rows[0].description,
      created: caseResult.rows[0].created_at,
      entities: entitiesResult.rows,
      exportedAt: new Date().toISOString()
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('subscribe:aircraft', () => {
    socket.join('aircraft-updates');
  });

  socket.on('subscribe:vessels', () => {
    socket.join('vessels-updates');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Intelligence Nexus API running on port ${PORT}`);
  console.log(`📊 Connected to PostgreSQL`);
  console.log(`🔗 Connected to Neo4j`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ 
    error: err.message,
    status: 'error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await neo4jDriver.close();
    pgPool.end();
  } catch (e) {
    console.error('Shutdown error:', e);
  }
  process.exit(0);
});
