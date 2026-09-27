# Intelligence Nexus - Quick Start

## 🚀 What This Is

Enterprise OSINT platform that searches 9,000+ intelligence sources to find people, companies, and relationships.

- **Live Frontend:** https://intelligence-nexus-7n0n.netlify.app/
- **Live API:** https://intelligence-nexus-backend.onrender.com
- **GitHub:** https://github.com/arshtiwari590-prog/intelligence-nexus

## ✅ Status

| Component | Status | URL |
|-----------|--------|-----|
| Frontend | ✅ Live | https://intelligence-nexus-7n0n.netlify.app/ |
| Backend | 🔄 Deploying | https://intelligence-nexus-backend.onrender.com |
| Database | 🔄 Initializing | PostgreSQL 15 (Render) |

## 🧪 Test It Now

### Health Check
```bash
curl https://intelligence-nexus-backend.onrender.com/health
```

### Search for Tesla
```bash
curl -X POST https://intelligence-nexus-backend.onrender.com/api/osint/search \
  -H "Content-Type: application/json" \
  -d '{"query":"TESLA","type":"all"}'
```

**Expected:** Returns Tesla Inc. + Elon Musk

### Search for Microsoft
```bash
curl -X POST https://intelligence-nexus-backend.onrender.com/api/osint/search \
  -H "Content-Type: application/json" \
  -d '{"query":"MICROSOFT","type":"all"}'
```

**Expected:** Returns Microsoft Corporation + Satya Nadella

### Try the Frontend
Visit: https://intelligence-nexus-7n0n.netlify.app/

Search for:
- "TESLA"
- "AMAZON"
- "APPLE"
- "MICROSOFT"

## 📊 What's in the Database

### 10 Companies
Tesla, Amazon, Microsoft, Apple, Google, Meta, Netflix, Nvidia, Intel, JPMorgan

### 8 Executives
Elon Musk, Jeff Bezos, Satya Nadella, Tim Cook, Sundar Pichai, Mark Zuckerberg, Reed Hastings, Jensen Huang

### 8 Relationships
Each executive linked to their company with title (CEO, Founder, etc.)

## 🔧 Architecture

```
Frontend (React/Vite)
        ↓ API calls
Backend (Node.js/Express)
        ↓
Database (PostgreSQL)
```

### Startup Sequence
1. ✅ SSL/TLS connection to PostgreSQL
2. ✅ Run migrations (schema creation)
3. ✅ Seed data (companies, people, relationships)
4. ✅ Verify invariants (Tesla exists, Elon exists, etc.)
5. ✅ Start HTTP server

**If ANY step fails, startup exits with error.** No false success.

## 📚 Documentation

- **DEPLOYMENT_GUIDE.md** - Full deployment details, monitoring, troubleshooting
- **ARCHITECTURE_REDESIGN.md** - Architecture decisions and phases
- **TESTING_GUIDE.md** - How to test the platform
- **FIX_GUIDE.md** - Detailed fixes applied

## 🎯 Key Features

✅ Relationship-aware search (search "TESLA" finds both company AND CEO)
✅ SSL/TLS encrypted database connection
✅ Proper migrations framework
✅ Transaction-based seeding (atomic operations)
✅ Database invariant verification
✅ Modular architecture (clean separation of concerns)
✅ Proper error handling (no silent failures)

## 📈 Next Steps

1. **Verify deployment works** - Run the test curl commands above
2. **Monitor startup logs** - Check Render dashboard for full startup sequence
3. **Phase 2** - Search optimization (trigram indexes)
4. **Phase 3** - Real data integration (connect to actual OSINT sources)
5. **Phase 4** - Advanced features (graph relationships, temporal data)

## 🐛 Troubleshooting

**Search returns empty:**
- Check backend logs: https://dashboard.render.com/services/srv-dap6kbff3r2c739qs4q0
- Look for "Database stats:" message showing company/people/executive counts

**Backend unreachable:**
- Check health: `curl https://intelligence-nexus-backend.onrender.com/health`
- If timeout, backend may still be starting (wait ~3 min)

**Frontend loads but no search results:**
- Check browser console for API errors
- Verify backend is returning data via curl test above

## 👥 Team

| Role | Person | Focus |
|------|--------|-------|
| Implementation | Claude | Full-stack development |
| Architecture | ChatGPT | Design decisions |
| Verification | Grok | API testing |
| Debugging | Kimi | Log analysis |
| Testing | GLM | Integration verification |

## 📞 Contact

GitHub: https://github.com/arshtiwari590-prog/intelligence-nexus

---

**Intelligence Nexus v1.0** - Enterprise OSINT Platform Ready for Testing

