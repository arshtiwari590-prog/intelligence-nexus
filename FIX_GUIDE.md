# 🔧 Intelligence Nexus - Complete Fix Guide

## STEP-BY-STEP FIXES

### STEP 1: Delete Redundant Backend Services (2 minutes)

Go to: https://dashboard.render.com

**Delete these 3 services (keep intelligence-nexus-backend):**

1. Click `osint-nexus` → Settings → Delete Service
2. Click `nexus-api-backend` → Settings → Delete Service
3. Click `intelligence-nexus-api` → Settings → Delete Service

**Keep:** `intelligence-nexus-backend`

---

### STEP 2: Set Environment Variables in Backend (3 minutes)

**For: intelligence-nexus-backend**

1. Go to: https://dashboard.render.com/web/srv-dap6kbff3r2c739qs4q0
2. Click **Settings** tab
3. Click **Environment** section
4. Add these variables:

```
DATABASE_URL=postgresql://[USER]:[PASSWORD]@[HOST]:5432/[DATABASE]
NEO4J_URI=neo4j://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
FRONTEND_URL=https://nexus-ui-69nz.onrender.com
NODE_ENV=production
PORT=3000
```

**Where to find DATABASE_URL:**
- Go to: Databases → intelligence-nexus-db
- Copy the "Internal Database URL"
- Paste into DATABASE_URL variable

5. Click **Save Changes**
6. Service will redeploy

---

### STEP 3: Get PostgreSQL Connection String (2 minutes)

1. Go to: https://dashboard.render.com/d/dpg-dap6j4g473hc73d8b570-a
2. Under **Internal Database URL**, copy the full string
3. It looks like: `postgresql://intelligence_nexus_db_user:PASSWORD@dpg-dap6j4g473hc73d8b570-a.oregon-postgres.render.com:5432/intelligence_nexus_db`
4. Paste this into the `DATABASE_URL` environment variable above

---

### STEP 4: Initialize PostgreSQL Database (5 minutes)

**Option A: Via Render Dashboard (Recommended)**

1. Open database dashboard: https://dashboard.render.com/d/dpg-dap6j4g473hc73d8b570-a
2. Click the **"Query"** button (if available)
3. Run the following SQL from `/home/claude/intelligence-nexus/schema.sql`:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- People table
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE,
  nationality VARCHAR(100),
  location VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- [Continue with remaining tables from schema.sql]
```

**Option B: Using psql (If you have local psql)**

```bash
psql postgresql://[USER]:[PASSWORD]@[HOST]:5432/[DB] < schema.sql
```

---

### STEP 5: Set Frontend Environment Variables (3 minutes)

**For: nexus-ui-69nz (Static Site)**

1. Go to: https://dashboard.render.com/static/srv-dap6kd8473hc73d8fe00
2. Click **Settings** tab
3. Click **Environment** section
4. Add:

```
VITE_API_URL=https://intelligence-nexus-backend.onrender.com
VITE_CESIUM_TOKEN=
```

**To get Cesium token (free):**
1. Go to: https://cesium.com/ion/
2. Sign up (free account)
3. Go to: https://cesium.com/ion/tokens
4. Copy the default token
5. Paste into VITE_CESIUM_TOKEN

5. Click **Save Changes**
6. Service will rebuild

---

### STEP 6: Verify Backend Health Check (2 minutes)

Once backend redeploys:

1. Go to: https://intelligence-nexus-backend.onrender.com/health
2. You should see: `{"status":"ok","timestamp":"2026-09-22T..."}`
3. If you see a 404 or error, environment variables not set correctly

**If backend still fails:**
- Check Render build logs
- Look for DATABASE_URL errors
- Verify PostgreSQL database URL is correct

---

### STEP 7: Test Frontend Search (2 minutes)

1. Go to: https://nexus-ui-69nz.onrender.com
2. Type any search query (e.g., "Tesla")
3. Click **Search**
4. If it works, you see results or proper error message
5. If CORS error appears, VITE_API_URL not set correctly

---

### STEP 8: Set Up Neo4j (Optional - For Graph Features)

**Currently:** Neo4j is not set up

**To enable Neo4j later:**

1. Create Neo4j instance:
   - Option A: Docker container in Render
   - Option B: Neo4j Aura (managed service)
   - Option C: Local neo4j (development only)

2. Update backend environment variables:
   ```
   NEO4J_URI=neo4j+s://[HOST]:7687
   NEO4J_USER=[USERNAME]
   NEO4J_PASSWORD=[PASSWORD]
   ```

3. Redeploy backend

**For now:** Graph features will show placeholder

---

## VERIFICATION CHECKLIST

After following all steps, verify:

### Backend Service
- ✅ https://intelligence-nexus-backend.onrender.com/health returns OK
- ✅ Render logs show no DATABASE_URL errors
- ✅ Build succeeded with no failures

### Frontend Service  
- ✅ https://nexus-ui-69nz.onrender.com loads without errors
- ✅ Search box appears
- ✅ Can type and submit searches

### Database
- ✅ PostgreSQL tables exist (run: SELECT * FROM people;)
- ✅ No "relation does not exist" errors
- ✅ Connection string works

### API Connection
- ✅ Frontend can reach backend (no CORS errors)
- ✅ Search returns results or proper error
- ✅ No 404 errors on /api/osint/search

### Map
- ✅ Map loads (may be blank if no Cesium token)
- ✅ No console errors about Cesium

---

## TROUBLESHOOTING

### Backend won't start
```
Error: Cannot read property of undefined
→ Check DATABASE_URL is set in Render environment
```

### Frontend shows 404
```
No webpage was found
→ Check Render build logs
→ Verify npm run build succeeds locally
```

### Search returns CORS error
```
Access to XMLHttpRequest blocked by CORS policy
→ Check VITE_API_URL is set in Render
→ Verify backend service URL is correct
→ Check CORS headers in server.js
```

### Map is blank
```
Black/gray screen on map
→ Cesium token not set or invalid
→ Get free token from cesium.com
→ Set VITE_CESIUM_TOKEN in Render
```

### Search returns 500 error
```
Server error
→ Check PostgreSQL tables exist
→ Run schema.sql to create tables
→ Check Render backend logs for details
```

### No real-time data
```
0 aircraft, 0 vessels
→ Neo4j not configured (expected for now)
→ WebSocket not connected
→ Will improve when Neo4j is set up
```

---

## ESTIMATED TIMELINE

| Step | Time | Status |
|------|------|--------|
| Delete backends | 2 min | Ready |
| Set env vars (backend) | 3 min | Ready |
| Get DB connection | 2 min | Ready |
| Initialize DB | 5 min | Ready |
| Set env vars (frontend) | 3 min | Ready |
| Get Cesium token | 2 min | Ready |
| Verify backend | 2 min | Ready |
| Test frontend | 2 min | Ready |
| **Total** | **21 minutes** | **Ready** |

---

## AFTER FIXES WORK

Once everything is working:

1. Commit verification tests to GitHub
2. Set up Neo4j for graph features
3. Configure real-time data feeds
4. Add authentication/authorization
5. Set up monitoring and alerts
6. Enable SSL/TLS enforcement
7. Configure rate limiting
8. Set up backup strategy

---

**All fixes are configuration, not code changes.**

**Platform will be LIVE in 30 minutes if you follow these steps.**

Ready to proceed?
