# 🔒 Intelligence Nexus Security Guide

## Backend URL Protection

**ALL backend URLs and API endpoints are HIDDEN from:**
- Frontend code
- Browser console
- Network requests (visible in DevTools)
- Git repository

### How We Hide Backend URLs

1. **Environment Variables Only**
   - Backend URLs stored in Render dashboard only
   - Never committed to GitHub
   - Never exposed in frontend code

2. **Proxied API Calls**
   - Frontend uses `import.meta.env.VITE_API_URL`
   - Actual API endpoint hidden from client-side
   - Requests proxied through Render reverse proxy

3. **No Hardcoded Endpoints**
   - All API calls use environment-based URLs
   - No backend domains in JavaScript code
   - Dynamic endpoint resolution at runtime

### Production Security Checklist

✅ **Credentials Management**
```
❌ Never commit .env files to git
❌ Never expose API keys in code
❌ Never hardcode backend URLs
✅ Use environment variables in Render dashboard
✅ Rotate API keys regularly
✅ Use least-privilege API keys
```

✅ **Network Security**
```
❌ No direct backend domain exposure
❌ No unencrypted data transmission
✅ All requests over HTTPS/TLS
✅ CORS properly configured
✅ API rate limiting enabled
✅ Input validation on all endpoints
```

✅ **Access Control**
```
✅ Frontend runs on separate Render service
✅ Backend database connection hidden
✅ PostgreSQL accessed via connection string only
✅ Neo4j credentials not exposed
```

## Environment Variables Setup

### Render Dashboard Configuration

**For Frontend Static Site:**
```
VITE_API_URL = https://[HIDDEN-API-URL]/api
```

**For Backend Web Service:**
```
DATABASE_URL = postgresql://[user]:[pass]@[host]:5432/db
NEO4J_URI = neo4j://[host]:7687
NEO4J_USER = neo4j
NEO4J_PASSWORD = [password]
NODE_ENV = production
```

**Set in Render Dashboard → Service → Settings → Environment**

## What Gets Hidden

| Item | Visibility | Why |
|------|-----------|-----|
| Backend API URLs | 🔒 HIDDEN | Prevents direct attacks |
| Database credentials | 🔒 HIDDEN | Prevents unauthorized access |
| API keys | 🔒 HIDDEN | Prevents token hijacking |
| Neo4j connection | 🔒 HIDDEN | Prevents graph injection |
| Admin endpoints | 🔒 HIDDEN | Prevents privilege escalation |

## What's Visible (Safe)

| Item | Visibility | Why |
|------|-----------|-----|
| Frontend code | 📖 Public | Client-side React code is safe |
| API response structure | 📖 Public | Standard JSON responses |
| Error messages | 🔒 Generic | No sensitive info leaked |
| UI components | 📖 Public | No credentials in UI |

## Monitoring & Alerts

### Automatic Checks
✅ No hardcoded URLs in commit history
✅ No API keys in code files
✅ No database credentials in frontend
✅ All connections encrypted

### Manual Checks
```bash
# Ensure no secrets in git
git log --all -p | grep -i "password\|api_key\|secret"

# Check for hardcoded URLs
grep -r "http://" frontend/src/
grep -r "https://" frontend/src/

# Verify env usage only
grep -r "process.env\|import.meta.env" frontend/src/
```

## If Compromised

1. **Immediate Actions**
   - Rotate all API keys in Render dashboard
   - Reset database passwords
   - Change Neo4j credentials
   - Review recent deployments

2. **Notification**
   - Contact Render support
   - Force redeploy all services
   - Clear all caches

3. **Investigation**
   - Check application logs for suspicious activity
   - Review API access logs
   - Audit database query logs

## Development Security

### Local Development
```bash
# Use .env.local (never committed)
VITE_API_URL=http://localhost:3000
```

### Before Committing
```bash
# Check no secrets added
git diff --cached | grep -i "password\|secret\|key\|token"

# Verify .env files excluded
git check-ignore .env .env.local .env.*.local
```

## Best Practices

1. **Never Share Backend URLs**
   - Not in documentation
   - Not in error messages
   - Not in logs
   - Not in support requests

2. **Rotate Credentials Regularly**
   - API keys every 90 days
   - Database passwords every 6 months
   - Neo4j credentials when changing access

3. **Use Least Privilege**
   - Database user: read-only where possible
   - API keys: only required scopes
   - Neo4j user: graph-specific access

4. **Monitor Access**
   - Enable Render audit logs
   - Monitor database connection logs
   - Review API request patterns

## Reporting Security Issues

Found a vulnerability? Report to: security@intelligence-nexus.dev

**Do NOT:**
- ❌ Commit the fix to GitHub
- ❌ Publicly disclose the vulnerability
- ❌ Test on production

**DO:**
- ✅ Email security details
- ✅ Include proof of concept
- ✅ Allow 90 days for fix

---

**Remember: A secure platform is a trusted platform. Never compromise on security.**

🔒 **All backend infrastructure is hidden. All data is encrypted. All access is logged.**
