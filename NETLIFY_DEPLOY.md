# 🚀 Deploy to Netlify (Easy One-Click)

Your Netlify project is ready: **intelligence-nexus-7n0n**

## Option 1: Connect GitHub to Netlify (EASIEST - 2 minutes)

1. Go to: https://app.netlify.com/sites/intelligence-nexus-7n0n/settings/builds
2. Click **"Connect repository"**
3. Select GitHub → arshtiwari590-prog/intelligence-nexus
4. Configure build settings:
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`
5. Click **Deploy site**
6. ✅ LIVE in 2 minutes!

## Option 2: Manual Deploy

```bash
cd /home/claude/intelligence-nexus
netlify login
netlify deploy --prod --dir frontend/dist
```

## Your New URL

🌐 https://intelligence-nexus-7n0n.netlify.app

(You can rename it later in Netlify settings)

## Environment Variables (if needed)

In Netlify dashboard → Site settings → Build & deploy → Environment:

```
VITE_API_URL=https://intelligence-nexus-backend.onrender.com
```

That's it! Your frontend will be deployed! 🚀
