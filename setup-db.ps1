# Setup PostgreSQL with Supabase

# 1. Create .env.local file if it doesn't exist
if (-not (Test-Path .env.local)) {
    @"
# Database
DATABASE_URL="postgresql://postgres:your-password@db.your-supabase-project.supabase.co:5432/postgres"

# Authentication
NEXTAUTH_SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")"
NEXTAUTH_URL="http://localhost:3000"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
"@ | Out-File -FilePath .env.local -Encoding utf8
    Write-Host "✅ Created .env.local file"
} else {
    Write-Host "ℹ️ .env.local already exists, skipping creation"
}

# 2. Install dependencies if needed
if (-not (Test-Path node_modules)) {
    Write-Host "Installing dependencies..."
    npm install
} else {
    Write-Host "✅ Dependencies already installed"
}

# 3. Generate Prisma client
Write-Host "Generating Prisma client..."
npx prisma generate

# 4. Push database schema
Write-Host "Pushing database schema..."
npx prisma db push --accept-data-loss

# 5. Seed the database
Write-Host "Seeding database..."
npx prisma db seed

Write-Host """

🚀 Setup complete! Next steps:

1. Edit the .env.local file with your Supabase credentials
2. Start the development server:
   npm run dev

Your app will be available at: http://localhost:3000
"""
