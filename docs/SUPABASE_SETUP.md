# Supabase Database Setup for SNPITC System

## 🎯 **Migration Overview**

**From**: SQLite (local file database)  
**To**: Supabase PostgreSQL (cloud database)  
**Purpose**: Enable Vercel deployment and improve scalability  

## 📋 **Setup Steps**

### **1. Create Supabase Project**

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with GitHub account
3. Click "New Project"
4. Fill in project details:
   - **Name**: `snpitc-email-payment`
   - **Database Password**: Generate strong password
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier (500MB database)

### **2. Get Connection Details**

After project creation, go to **Settings > Database**:

```env
# Supabase Configuration
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Database Connection (for Prisma)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres"
```

### **3. Update Prisma Schema**

Change from SQLite to PostgreSQL:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}

// Update ID fields from String to Int with @id @default(autoincrement())
model User {
  id        Int      @id @default(autoincrement())  // Changed from String @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  role      Role     @default(STUDENT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  emailAccounts EmailAccount[]
  payments      Payment[]

  @@map("users")
}

// Apply similar changes to all models...
```

### **4. Environment Variables**

Update your environment files:

**.env.local** (Development):
```env
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Supabase
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# NextAuth.js
NEXTAUTH_SECRET="snpitc-nextauth-secret-2024-fixed-client-fetch-error-development"
NEXTAUTH_URL="http://localhost:3000"
```

**Vercel Environment Variables** (Production):
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
NEXTAUTH_SECRET="[GENERATE-NEW-PRODUCTION-SECRET]"
NEXTAUTH_URL="https://your-app.vercel.app"
```

### **5. Migration Commands**

```bash
# Install PostgreSQL dependencies
npm install pg @types/pg

# Reset Prisma client for PostgreSQL
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name init

# Seed the database (optional)
npx prisma db seed
```

## 🔄 **Data Migration Process**

### **Step 1: Export SQLite Data**

```typescript
// scripts/export-sqlite-data.ts
import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function exportData() {
  const data = {
    users: await prisma.user.findMany(),
    emailAccounts: await prisma.emailAccount.findMany(),
    emails: await prisma.email.findMany({
      include: {
        recipients: true,
        attachments: true,
        folders: true
      }
    }),
    payments: await prisma.payment.findMany(),
    paymentCatalogItems: await prisma.paymentCatalogItem.findMany(),
    settings: await prisma.settings.findMany()
  }

  fs.writeFileSync('data-export.json', JSON.stringify(data, null, 2))
  console.log('Data exported to data-export.json')
}

exportData()
```

### **Step 2: Import to Supabase**

```typescript
// scripts/import-to-supabase.ts
import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function importData() {
  const data = JSON.parse(fs.readFileSync('data-export.json', 'utf8'))

  // Import users first (no dependencies)
  for (const user of data.users) {
    await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: user.password,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })
  }

  // Import other data with proper relationships...
  console.log('Data imported successfully')
}

importData()
```

## 🔧 **Prisma Configuration Updates**

### **Connection Pooling**

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## 🚀 **Vercel Deployment Configuration**

### **vercel.json**

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "NEXTAUTH_URL": "@nextauth_url"
  }
}
```

### **Build Configuration**

```json
// package.json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

## ✅ **Benefits of Supabase Migration**

1. **Vercel Compatibility**: Full serverless deployment support
2. **Scalability**: Handle thousands of concurrent users
3. **Reliability**: 99.9% uptime SLA
4. **Real-time**: Built-in real-time subscriptions
5. **Security**: Row Level Security (RLS) policies
6. **Backup**: Automatic daily backups
7. **Monitoring**: Built-in database monitoring and logs

## 🔐 **Security Considerations**

1. **Environment Variables**: Never commit database credentials
2. **Connection Limits**: Use connection pooling for serverless
3. **RLS Policies**: Implement row-level security in Supabase
4. **API Keys**: Use service role key only for server-side operations

## 📊 **Free Tier Limits**

- **Database Size**: 500MB
- **Bandwidth**: 2GB/month
- **File Storage**: 1GB
- **Realtime Connections**: 200 concurrent
- **Edge Functions**: 500,000 invocations/month

These limits are sufficient for the SNPITC system's initial deployment and growth.
