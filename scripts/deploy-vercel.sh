#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Vercel deployment..."

# Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
  echo "Installing Vercel CLI..."
  npm install -g vercel@latest
fi

# Login to Vercel (will open browser for authentication if not already logged in)
vercel login

# Set environment variables
export NEXT_TELEMETRY_DISABLED=1

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

# Set environment variables in Vercel
echo "🔧 Setting environment variables..."
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_URL_INTERNAL production

# Redeploy with new environment variables
echo "🔄 Triggering redeployment with new environment variables..."
vercel --prod

echo "✅ Deployment complete!"
echo "🔗 Your site is live at: $(vercel ls | grep -o 'https://[^ ]*' | head -n 1)"
