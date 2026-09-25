# Deploy to Netlify - Manual Method (Fastest)

Your frontend is built and ready to deploy!

## Option 1: Drag & Drop Deploy (30 seconds) ✅ FASTEST

1. Go to: https://app.netlify.com/sites/intelligence-nexus-7n0n/overview

2. Find "Deploys" section

3. Drag and drop this folder:
   `/home/claude/intelligence-nexus/frontend/dist`
   
   OR upload this zip:
   `/tmp/site.zip`

4. ✅ DONE! Site will be live immediately!

## Option 2: Connect GitHub (2-3 minutes)

1. Go to: https://app.netlify.com/sites/intelligence-nexus-7n0n/settings/builds

2. Click "Connect repository"

3. Select:
   - Provider: GitHub
   - Repository: arshtiwari590-prog/intelligence-nexus
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`

4. Click "Save" - auto-deploy starts!

## Frontend Build Info

- Built with: React 18 + Vite
- Size: 47KB (zipped)
- Files: index.html + CSS + JS bundle
- Includes _redirects for API routing to backend

## API Routing

All `/api/*` requests automatically route to:
```
https://intelligence-nexus-backend.onrender.com/api/*
```

## Your Site

Once deployed:
🌐 https://intelligence-nexus-7n0n.netlify.app

Ready to go!
