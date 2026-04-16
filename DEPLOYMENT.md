# Cloudflare Deployment Guide for Nexus HR Buddy

This guide explains how to deploy the Nexus HR Buddy application to Cloudflare.

## Architecture Overview

Nexus HR Buddy is a full-stack application with:
- **Frontend**: React + Vite SPA (`artifacts/nexus-hr`)
- **API Server**: Express.js backend with WebSocket support (`artifacts/api-server`)
- **Database**: PostgreSQL

## Deployment Strategy

### Frontend → Cloudflare Pages
The React frontend can be deployed directly to Cloudflare Pages.

### API Server → Alternative Platform
**Important**: The Express.js API server with WebSocket support cannot run directly on Cloudflare Workers due to platform limitations:
- Cloudflare Workers don't support Node.js's `http.createServer`
- WebSocket support on Workers requires different APIs
- PostgreSQL connections need special handling

**Recommended options for API deployment**:
1. **Railway** - Easy PostgreSQL + Node.js deployment
2. **Render** - Free tier available with PostgreSQL
3. **Fly.io** - Global deployment with database support
4. **Cloudflare Workers** - Requires refactoring to use Hono/fetch handlers and D1/external DB

## Prerequisites

1. **Cloudflare Account**: Sign up at https://cloudflare.com
2. **Cloudflare API Token**:
   - Go to Cloudflare Dashboard → My Profile → API Tokens
   - Create token with "Edit Cloudflare Workers" permissions
3. **GitHub Repository**: Your code should be in a GitHub repository
4. **Node.js & pnpm**: Version 24+ and pnpm installed locally

## Method 1: Automated GitHub Actions Deployment (Recommended)

### Setup GitHub Secrets

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```
CLOUDFLARE_API_TOKEN=<your_cloudflare_api_token>
CLOUDFLARE_ACCOUNT_ID=<your_cloudflare_account_id>
```

To find your Account ID:
1. Log in to Cloudflare Dashboard
2. Select your domain/account
3. Account ID is visible in the right sidebar

### Deploy

The deployment workflow (`.github/workflows/deploy-cloudflare.yml`) will automatically:
1. Trigger on pushes to `main` branch
2. Build the frontend with proper environment variables
3. Deploy to Cloudflare Pages

You can also manually trigger deployment:
1. Go to Actions tab in GitHub
2. Select "Deploy to Cloudflare Pages"
3. Click "Run workflow"

### Configure Environment Variables in Cloudflare

After first deployment:
1. Go to Cloudflare Dashboard → Pages → nexus-hr-buddy
2. Settings → Environment variables
3. Add required variables from `.env.example`:
   - `API_BASE_URL` - URL of your deployed API server
   - `CLERK_PUBLISHABLE_KEY` - For authentication
   - Add other environment variables as needed

## Method 2: Manual Deployment with Wrangler

### Install Dependencies

```bash
pnpm install
```

### Build Frontend

```bash
pnpm run build:frontend
```

### Login to Cloudflare

```bash
pnpm wrangler login
```

### Deploy to Cloudflare Pages

```bash
pnpm run deploy:cloudflare
```

Or directly with wrangler:

```bash
pnpm wrangler pages deploy artifacts/nexus-hr/dist/public --project-name=nexus-hr-buddy
```

## Method 3: Connect GitHub Repository to Cloudflare Pages (UI)

1. Go to Cloudflare Dashboard → Pages
2. Click "Create a project"
3. Select "Connect to Git"
4. Choose your GitHub repository
5. Configure build settings:
   - **Build command**: `PORT=3000 BASE_PATH=/ pnpm run build:frontend`
   - **Build output directory**: `artifacts/nexus-hr/dist/public`
   - **Root directory**: Leave empty (monorepo root)
   - **Environment variables**: Add from `.env.example`
6. Click "Save and Deploy"

## Deploying the API Server

Since the API server cannot run on Cloudflare Workers, here are recommended alternatives:

### Option 1: Railway (Recommended)

1. Sign up at https://railway.app
2. Create new project from GitHub repo
3. Add PostgreSQL service
4. Configure environment variables
5. Deploy API server:
   - **Build Command**: `pnpm run build:api`
   - **Start Command**: `cd artifacts/api-server && node --enable-source-maps ./dist/index.mjs`
   - **Root Directory**: `/`

### Option 2: Render

1. Sign up at https://render.com
2. Create new "Web Service" from GitHub
3. Add PostgreSQL database
4. Configure:
   - **Build Command**: `pnpm install && pnpm run build:api`
   - **Start Command**: `cd artifacts/api-server && node dist/index.mjs`
5. Set environment variables

### Option 3: Fly.io

1. Install flyctl: https://fly.io/docs/hands-on/install-flyctl/
2. Create `fly.toml` in repository root
3. Deploy with `fly deploy`

## Environment Variables Reference

See `.env.example` for complete list of required environment variables.

### Critical Variables:

#### Frontend (Cloudflare Pages)
- `PORT` - Port for build process (default: 3000)
- `BASE_PATH` - Base path for routing (default: /)
- `API_BASE_URL` - URL of your deployed API server

#### API Server (External Platform)
- `PORT` - Server port
- `DATABASE_URL` - PostgreSQL connection string
- `CLERK_SECRET_KEY` - Authentication secret
- `STRIPE_SECRET_KEY` - Payment processing
- All other secrets from `.env.example`

## Post-Deployment Configuration

### 1. Update API URL in Frontend

In Cloudflare Pages environment variables, set:
```
API_BASE_URL=https://your-api-server.railway.app
```

### 2. Configure CORS

Update API server CORS configuration to allow requests from:
```
https://nexus-hr-buddy.pages.dev
https://your-custom-domain.com
```

### 3. Custom Domain (Optional)

#### Cloudflare Pages:
1. Go to Pages → nexus-hr-buddy → Custom domains
2. Add your domain
3. Follow DNS configuration instructions

### 4. Database Setup

Ensure PostgreSQL database is provisioned and:
- Run migrations if needed
- Seed initial data using provided scripts
- Configure connection pooling for production

## Build Verification

Test the build locally before deploying:

```bash
# Build frontend
PORT=3000 BASE_PATH=/ pnpm run build:frontend

# Verify build output
ls -la artifacts/nexus-hr/dist/public

# Build API
pnpm run build:api

# Verify API build
ls -la artifacts/api-server/dist
```

## Troubleshooting

### Build Fails with Environment Variable Error

Ensure `PORT` and `BASE_PATH` are set:
```bash
export PORT=3000
export BASE_PATH=/
pnpm run build:frontend
```

### API Connection Issues

1. Check `API_BASE_URL` in Cloudflare Pages environment variables
2. Verify CORS configuration in API server
3. Check API server logs for errors
4. Ensure API server is deployed and running

### WebSocket Connection Fails

WebSocket connections from Cloudflare Pages should work with external API servers. Ensure:
1. API server supports WebSocket upgrade
2. Load balancer/proxy preserves WebSocket connections
3. CORS allows WebSocket connections

## Production Checklist

- [ ] Frontend deployed to Cloudflare Pages
- [ ] API server deployed to Railway/Render/Fly.io
- [ ] PostgreSQL database provisioned and configured
- [ ] All environment variables set correctly
- [ ] Database migrations run
- [ ] CORS configured to allow frontend domain
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active
- [ ] Authentication (Clerk) configured
- [ ] Payment integration (Stripe/PayPal) configured
- [ ] Email service configured
- [ ] Monitoring and logging set up

## Monitoring and Logs

### Cloudflare Pages Logs
- View deployment logs in Cloudflare Dashboard → Pages → Deployments
- Real-time function logs available in dashboard

### API Server Logs
- Check your API platform's logging dashboard
- Railway: View logs in project dashboard
- Render: Logs tab in service dashboard
- Fly.io: `fly logs` command

## Rollback Procedure

### Cloudflare Pages
1. Go to Pages → nexus-hr-buddy → Deployments
2. Find previous successful deployment
3. Click "..." → "Rollback to this deployment"

### API Server
Follow your platform's rollback procedure (Railway/Render/Fly.io)

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)

## Support

For deployment issues:
1. Check Cloudflare Status page
2. Review deployment logs
3. Check API server platform status
4. Verify environment variables
5. Review this guide's troubleshooting section
