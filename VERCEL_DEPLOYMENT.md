# Vercel Deployment Guide for Daily Brain PWA

This guide covers deploying the Daily Brain PWA to Vercel.

---

## Prerequisites

- Vercel account (https://vercel.com/signup)
- GitHub repository connected to Vercel
- Node.js 18+ locally for development

---

## Step 1: Project Configuration

### 1.1 Create `vercel.json`

Create this file in the project root to configure Vercel:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" },
        { "key": "Service-Worker-Allowed", "value": "/" }
      ]
    },
    {
      "source": "/manifest.json",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### 1.2 Update `vite.config.ts`

Ensure your Vite config is production-ready:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png', 'fonts/*.woff2'],
      manifest: {
        name: 'Daily Brain - Train Your Mind',
        short_name: 'Daily Brain',
        description: 'A new brain training game every day',
        theme_color: '#4a90d9',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts']
        }
      }
    }
  }
});
```

---

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click "Add New..." → "Project"

2. **Import Git Repository**
   - Select "Import Git Repository"
   - Choose your GitHub repository (`braingame`)
   - Click "Import"

3. **Configure Project**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (or subdirectory if app is nested)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Environment Variables** (Add if needed)
   ```
   VITE_API_URL=https://api.yourdomain.com
   VITE_VAPID_PUBLIC_KEY=your_vapid_key
   ```

5. **Click "Deploy"**

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# For production deployment
vercel --prod
```

---

## Step 3: Environment Variables

### Set Environment Variables in Vercel

1. Go to Project Settings → Environment Variables
2. Add the following:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_URL` | `https://api.dailybrain.app` | Production |
| `VITE_API_URL` | `https://api-dev.dailybrain.app` | Preview |
| `VITE_VAPID_PUBLIC_KEY` | Your VAPID public key | All |
| `VITE_ANALYTICS_ID` | Your analytics ID | Production |

### Access in Code

```typescript
// src/config.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  vapidKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
  analyticsId: import.meta.env.VITE_ANALYTICS_ID
};
```

---

## Step 4: Custom Domain Setup

### Add Custom Domain

1. Go to Project Settings → Domains
2. Add your domain: `dailybrain.app`
3. Add `www.dailybrain.app` and redirect to apex

### DNS Configuration

Add these records at your domain registrar:

| Type | Name | Value |
|------|------|-------|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

### Enable HTTPS

Vercel automatically provisions SSL certificates via Let's Encrypt.

---

## Step 5: PWA-Specific Settings

### Service Worker Headers

The `vercel.json` configuration ensures:
- Service worker (`sw.js`) is never cached
- Manifest is served fresh
- Security headers are applied

### Caching Strategy

For optimal PWA performance:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*).js",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## Step 6: Backend API (Optional)

If deploying the backend API on Vercel as well:

### Serverless Functions

Create API routes in `/api` directory:

```
api/
├── daily/
│   └── [date].ts      # GET /api/daily/:date
├── results.ts          # POST /api/results
└── push/
    └── subscribe.ts    # POST /api/push/subscribe
```

### Example Serverless Function

```typescript
// api/daily/[date].ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DailyContentResolver } from '../../src/services/dailyContent';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { date } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const content = await DailyContentResolver.resolve(new Date(date as string));
    return res.status(200).json(content);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get daily content' });
  }
}
```

### Database Connection

For PostgreSQL with Prisma on Vercel:

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

Add to environment variables:
```
DATABASE_URL=postgresql://user:pass@host:5432/dailybrain?sslmode=require
```

---

## Step 7: Continuous Deployment

### Automatic Deployments

Vercel automatically deploys:
- **Production:** When pushing to `main` branch
- **Preview:** When pushing to any other branch or opening PRs

### Branch Configuration

In Project Settings → Git:
- Production Branch: `main`
- Preview Branches: All other branches

### Deploy Hooks (Optional)

Create a deploy hook for external triggers:
1. Go to Project Settings → Git → Deploy Hooks
2. Create hook named "Redeploy"
3. Use webhook URL to trigger deployments

---

## Step 8: Monitoring & Analytics

### Vercel Analytics (Built-in)

Enable in Project Settings → Analytics:
- Web Vitals tracking
- Real user monitoring
- Performance insights

### Speed Insights

```bash
npm install @vercel/speed-insights
```

```typescript
// src/main.tsx
import { SpeedInsights } from '@vercel/speed-insights/react';

function App() {
  return (
    <>
      <Router />
      <SpeedInsights />
    </>
  );
}
```

### Vercel Web Analytics

```bash
npm install @vercel/analytics
```

```typescript
// src/main.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <Router />
      <Analytics />
    </>
  );
}
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All environment variables set
- [ ] `vercel.json` configured
- [ ] PWA manifest with all icon sizes
- [ ] Service worker tested
- [ ] Build succeeds locally (`npm run build`)
- [ ] Preview deployment tested
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Analytics enabled
- [ ] Error monitoring set up (Sentry)

---

## Troubleshooting

### Common Issues

**Build Fails:**
```bash
# Check build locally first
npm run build
```

**Service Worker Not Updating:**
- Ensure `sw.js` has no-cache headers
- Clear browser cache and re-register

**404 on Client Routes:**
- Ensure rewrites are configured in `vercel.json`
- SPA fallback: `{ "source": "/(.*)", "destination": "/index.html" }`

**Environment Variables Not Available:**
- Prefix with `VITE_` for client-side access
- Redeploy after adding new variables

---

## Quick Reference Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod

# List deployments
vercel ls

# View logs
vercel logs <deployment-url>

# Pull environment variables locally
vercel env pull .env.local

# Link existing project
vercel link
```

---

*Vercel Deployment Guide v1.0*
