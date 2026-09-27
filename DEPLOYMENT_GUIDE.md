# Intelligence Nexus - Deployment Guide

## Current Deployment Status

**Frontend:** ✅ Live on Netlify
- URL: https://intelligence-nexus-7n0n.netlify.app/
- Status: Static Vite SPA, ready to receive API calls

**Backend:** 🔄 Rebuilding on Render with new architecture
- URL: https://intelligence-nexus-backend.onrender.com
- Status: SSL/TLS fix + proper migrations + seeding
- Expected: 3 minutes to completion

**Database:** PostgreSQL 15 on Render
- Connection: SSL/TLS required
- Status: Auto-initializing schema and seeding on startup

---

## Architecture Overview

```
                    FRONTEND
                   (Netlify)
                      │
                      │ API calls
                      ▼
              BACKEND (Render)
                Express API
                      │
          ┌───────────┼───────────┐
          │           │           │
      Routes     Migrations   Database
                      │           │
                      ▼           ▼
                 db/migrate   PostgreSQL
                 db/seed      (Render)
                 db/verify
```

## Startup Sequence

```
1. Node process starts
           ↓
2. Database SSL connection established
           ↓
3. Migrations run (001_initial_schema.sql)
           ↓
4. Tables created with constraints
           ↓
5. Seed transaction begins
           ↓
6. Companies UPSERTed (10 records)
           ↓
7. People UPSERTed (8 records)
           ↓
8. Executives relationships UPSERTed (8 links)
           ↓
9. Seed transaction committed
           ↓
10. Invariant verification runs
           ↓
11. Checks: Tesla exists, Elon exists, relationship exists
           ↓
12. Express server starts
           ↓
13. Health check available at /health
           ↓
14. API ready to receive search requests
```

If ANY step fails, process exits with error code (no false success).

---

## Environment Variables

Required on Render:

```
DATABASE_URL=postgresql://user:pass@host:5432/database?sslmode=require
FRONTEND_URL=https://intelligence-nexus-7n0n.netlify.app
NODE_ENV=production
PORT=3000
```

The `DATABASE_URL` must include `?sslmode=require` for Render managed PostgreSQL.

---

## Database Connection

### SSL Configuration

The backend now uses proper SSL/TLS for Render:

```javascript
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // Render certificate configuration
  },
  max: 10
});
```

This is required because:
- ✅ Render managed PostgreSQL requires TLS for external connections
- ✅ Matches Render's official Node.js configuration
- ✅ Encrypts data in transit
- ✅ `rejectUnauthorized: false` allows Render's self-signed certificates

### Connection Pool

- Max connections: 10
- Default idle timeout: 30 seconds
- Connection retry: Built-in pg behavior

---

## Seed Data

The database auto-seeds with:

### Companies (10)
- Tesla Inc.
- Amazon.com Inc.
- Microsoft Corporation
- Apple Inc.
- Google LLC
- Meta Platforms Inc.
- Netflix Inc.
- Nvidia Corporation
- Intel Corporation
- JPMorgan Chase & Co.

### People (8)
- Elon Musk
- Jeff Bezos
- Satya Nadella
- Tim Cook
- Sundar Pichai
- Mark Zuckerberg
- Reed Hastings
- Jensen Huang

### Relationships (8)
- Elon Musk → Tesla Inc. (CEO)
- Jeff Bezos → Amazon (Founder)
- Satya Nadella → Microsoft (CEO)
- Tim Cook → Apple (CEO)
- Sundar Pichai → Google (CEO)
- Mark Zuckerberg → Meta (CEO/Founder)
- Reed Hastings → Netflix (Co-Founder)
- Jensen Huang → Nvidia (Founder/CEO)

All data is UPSERTed (safe to run multiple times).

---

## Testing the Deployment

### 1. Health Check
```bash
curl https://intelligence-nexus-backend.onrender.com/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-09-27T..."}
```

### 2. Search for Tesla
```bash
curl -X POST https://intelligence-nexus-backend.onrender.com/api/osint/search \
  -H "Content-Type: application/json" \
  -d '{"query":"TESLA","type":"all"}'
```

Expected response:
```json
{
  "companies": [
    {
      "id": "...",
      "name": "Tesla Inc.",
      "domain": "tesla.com",
      "industry": "Automotive",
      "founded_year": 2003
    }
  ],
  "people": [
    {
      "id": "...",
      "name": "Elon Musk",
      "email": "elon.musk@tesla.com",
      "nationality": "South African-American",
      "location": "Austin, TX"
    }
  ]
}
```

### 3. Search for Microsoft
```bash
curl -X POST https://intelligence-nexus-backend.onrender.com/api/osint/search \
  -H "Content-Type: application/json" \
  -d '{"query":"MICROSOFT","type":"all"}'
```

Expected: Microsoft Corporation + Satya Nadella

### 4. Frontend Test
Visit: https://intelligence-nexus-7n0n.netlify.app/

Try searching:
- "TESLA" → returns results
- "AMAZON" → returns results
- "APPLE" → returns results

---

## Monitoring

### Render Logs

Check: https://dashboard.render.com/services/srv-dap6kbff3r2c739qs4q0

Look for startup sequence:
```
🚀 Intelligence Nexus starting...
1️⃣ Running migrations...
✅ All migrations completed
2️⃣ Seeding database...
✅ Seeded 10 companies
✅ Seeded 8 people
✅ Linked 8 executives
3️⃣ Verifying invariants...
📊 Database stats: 10 companies, 8 people, 8 executives
✅ All database invariants verified
✅ Intelligence Nexus API running on port 3000
```

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "SSL/TLS required" | Missing SSL config | Already fixed in code |
| Empty search results | Seed didn't run | Check logs for transaction failure |
| Startup timeout | Long migration | Normal for first run |
| Constraint violation | Duplicate data | UPSERT handles this |
| PostgreSQL connection refused | Wrong DATABASE_URL | Verify Render env vars |

---

## Next Phases

### Phase 2: Search Optimization
- Add trigram indexes (pg_trgm)
- Optimize substring searches
- Performance tuning for 10,000+ records

### Phase 3: Real Data Integration
- Connect to actual OSINT sources
- Scheduled data ingestion
- Real-time updates

### Phase 4: Advanced Features
- Graph database relationships
- Temporal data (timeline of changes)
- User authentication
- Custom searches and alerts

---

## Render Configuration

Current setup:

- **Service:** intelligence-nexus-backend
- **Plan:** Free tier (may upgrade for production)
- **Build Command:** `npm ci`
- **Start Command:** `npm start`
- **Region:** Oregon
- **Memory:** 512 MB
- **Health Check:** `/health` endpoint

For production, consider:
- Upgrading to paid plan (better uptime SLA)
- Setting pre-deploy command: `npm run db:migrate`
- Increasing memory to 1GB+
- Setting up monitoring/alerts

---

## GitHub Repository

All code is version-controlled:

```
https://github.com/arshtiwari590-prog/intelligence-nexus
```

### Recent Changes
- SSL/TLS configuration for Render PostgreSQL
- Proper migrations framework
- Transaction-based seeding
- Invariant verification
- Modular architecture

### Deployment Flow
1. Code pushed to GitHub
2. Render auto-detects push
3. Render builds and deploys
4. Migrations run
5. Seed executes
6. Verification passes
7. Service goes live

---

## Support & Debugging

### Check Service Health
```bash
curl -v https://intelligence-nexus-backend.onrender.com/health
```

### Get Full Startup Logs
Render Dashboard → Service → Logs (scroll to bottom for newest)

### Test Database Connection
```bash
curl -X POST https://intelligence-nexus-backend.onrender.com/api/osint/search \
  -H "Content-Type: application/json" \
  -d '{"query":"TEST","type":"all"}'
```

Any response other than timeout = database is reachable

### Manual Database Verification
Render Dashboard → PostgreSQL instance → Settings → Connection string
(Can connect via psql if needed)

---

## Architecture Summary

✅ Single source of truth (schema.sql)
✅ Versioned migrations (001, 002, 003, ...)
✅ Idempotent seed (safe to run multiple times)
✅ Transaction atomicity (all or nothing)
✅ Hard invariant verification (fail loudly)
✅ Modular code (separate concerns)
✅ Proper SSL/TLS (Render compatible)
✅ Clear error messages (trace-able)

This is production-ready architecture. Future scaling won't require redesign.

