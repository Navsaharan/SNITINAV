# PowerShell script to deploy to Vercel

# Step 1: Clean up any existing Vercel project
Write-Host "🔍 Checking for existing Vercel projects..."
vercel ls

# Step 2: Create a new Vercel project
Write-Host "🚀 Creating new Vercel project..."
vercel --scope navsaharans-projects --name snitinew --yes

# Step 3: Deploy the project
Write-Host "🚀 Deploying to Vercel..."
vercel --prod --confirm

# Step 4: Open the project in the browser
Write-Host "🌐 Opening project in browser..."
Start-Process "https://vercel.com/navsaharans-projects/snitinew"

Write-Host "✅ Deployment complete!"
