#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Remove existing .vercel directory if it exists
if [ -d ".vercel" ]; then
  echo "🗑️  Removing existing .vercel directory..."
  rm -rf .vercel
fi

# Create a fresh .vercel directory
mkdir -p .vercel

# Copy environment variables
cp .vercel/.env.local .vercel/.env 2>/dev/null || :

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Remove existing Vercel project link if it exists
if [ -f ".vercel/project.json" ]; then
  echo "🔗 Removing existing Vercel project link..."
  vercel project rm snitinav --yes 2>/dev/null || :
fi

# Link to the new Vercel project
echo "🔗 Linking to Vercel project..."
vercel link -y --name snitinav --scope navsaharans-projects

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod --confirm

echo "✅ Deployment completed successfully!"
echo "🌐 Your app is now live at: https://snitinav.vercel.app"
