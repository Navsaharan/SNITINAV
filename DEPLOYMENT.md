# SNITINAV - Deployment Guide

## Project Overview
This is the deployment guide for the SNITINAV project, a Next.js application deployed on Vercel with a Supabase PostgreSQL database.

## Prerequisites
- Node.js 18+
- Vercel CLI (`npm install -g vercel`)
- Supabase PostgreSQL database (already configured)
- Git (for version control)

## Environment Variables
Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://postgres:Navsaharan89%40@db.yemsrezmtmewkfflckxn.supabase.co:5432/postgres?schema=public&connection_limit=5&pgbouncer=true&sslmode=require"

# Authentication
NEXTAUTH_SECRET="9GUwY41enBGWh4LbYy9EhMuPUfkFd40CZom0nAfW0AA="
NEXTAUTH_URL="https://snitinav.vercel.app"
NEXTAUTH_URL_INTERNAL="https://snitinav.vercel.app"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://yemsrezmtmewkfflckxn.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Environment
NODE_ENV="production"
VERCEL_ENV="production"
VERCEL_URL="https://snitinav.vercel.app"
```

## Deployment Steps

### Option 1: Using Deployment Script (Recommended)

1. Make the deployment script executable:
   ```bash
   chmod +x ./scripts/deploy.sh
   ```

2. Run the deployment script:
   ```bash
   ./scripts/deploy.sh
   ```
   This script will:
   - Install dependencies
   - Build the project
   - Link to the Vercel project
   - Deploy to production

### Option 2: Manual Deployment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Link to the Vercel project (first time only):
   ```bash
   vercel link -y --name snitinav --scope navsaharans-projects
   ```

3. Build the project:
   ```bash
   npm run build:prod
   ```

4. Deploy to production:
   ```bash
   vercel --prod
   ```

### CI/CD Deployment
For CI/CD pipelines, use:
```bash
npm ci
npm run build:prod
vercel --prod --confirm
```

## Post-Deployment

1. **Verify Deployment**
   - Visit: https://snitinav.vercel.app
   - Check the Vercel dashboard for build logs

2. **Environment Variables**
   - Ensure all environment variables are set in the Vercel project settings
   - Update any domain-specific variables if needed

3. **Database**
   - Run migrations if needed:
     ```bash
     npx prisma migrate deploy
     ```
   - Seed the database if required:
     ```bash
     npx prisma db seed
     ```

## Rollback
To rollback to a previous deployment:
1. Go to the Vercel dashboard
2. Select the project
3. Navigate to the "Deployments" tab
4. Find the previous deployment and click "Redeploy"

## Troubleshooting

### Common Issues
1. **Environment Variables**
   - Ensure all required variables are set in Vercel
   - Check for typos in variable names

2. **Database Connection**
   - Verify the database URL is correct
   - Check if the database is accessible from Vercel's IPs
   - Ensure SSL is properly configured

3. **Build Failures**
   - Check the build logs in the Vercel dashboard
   - Run the build locally to identify issues
   ```bash
   npm run build
   ```

### Support
For additional support, contact the development team or refer to the project documentation.

## Performance Optimization
- Database queries are cached for 5 minutes
- Static assets are automatically optimized by Vercel
- API routes have increased memory and timeout limits
- Edge caching is enabled for better performance

## Troubleshooting

### Database Connection Issues
1. Verify your `DATABASE_URL` is correct
2. Check if your database allows connections from Vercel's IPs
3. Run `npx prisma generate` if you get Prisma client errors

### Build Failures
1. Check Node.js version (requires 18+)
2. Ensure all environment variables are set
3. Run `npm install` with `--force` if there are dependency issues

## Monitoring
- Check Vercel dashboard for deployment status
- Monitor database performance in Supabase dashboard
- Enable Vercel Analytics for performance insights
