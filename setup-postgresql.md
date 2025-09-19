# PostgreSQL Setup Guide

Since Docker is not available on your system, here are alternative ways to set up PostgreSQL:

## Option 1: Install PostgreSQL Locally (Recommended)

1. **Download PostgreSQL for Windows:**
   - Go to https://www.postgresql.org/download/windows/
   - Download the installer for Windows
   - Run the installer and follow the setup wizard
   - Set password as `password` (or update the script accordingly)
   - Default port is 5432

2. **Create Database:**
   ```sql
   CREATE DATABASE navjeet_db;
   ```

## Option 2: Use Cloud PostgreSQL (Easiest)

### Supabase (Free tier available)
1. Go to https://supabase.com
2. Create a free account
3. Create a new project
4. Get your database URL from Settings > Database
5. Use the connection string in your .env.local

### Railway (Free tier available)
1. Go to https://railway.app
2. Create account and new project
3. Add PostgreSQL service
4. Get connection string from Variables tab

### Neon (Free tier available)
1. Go to https://neon.tech
2. Create account and database
3. Get connection string

## Option 3: Use Online PostgreSQL Playground
- ElephantSQL (free tier)
- Aiven (free trial)

## Next Steps After PostgreSQL Setup:

1. Update your `.env.local` with PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/navjeet_db"
   ```

2. Run the migration script:
   ```bash
   node scripts/sqlite-to-postgresql.js
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

4. Run Prisma migrations:
   ```bash
   npx prisma db push
   ```

Choose the option that works best for you!
