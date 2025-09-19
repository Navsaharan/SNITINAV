import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with error handling for build time and serverless optimization
function createPrismaClient() {
  // Skip in build context
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    console.warn('Skipping Prisma Client creation in non-Vercel production')
    return null as any
  }

  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set')
    return null as any
  }

  try {
    // Add SSL configuration to the database URL if it's a Supabase connection
    const databaseUrl = process.env.DATABASE_URL.includes('supabase')
      ? `${process.env.DATABASE_URL}?sslmode=require&pgbouncer=true&connection_limit=5`
      : process.env.DATABASE_URL

    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    })
  } catch (error) {
    console.error('Failed to create Prisma Client:', error)
    return null as any
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Utility function for serverless environments to ensure proper cleanup
export async function disconnectPrisma() {
  if (prisma && typeof prisma.$disconnect === 'function') {
    await prisma.$disconnect()
  }
}

// Auto-disconnect in serverless environments
if (typeof process !== 'undefined' && process.env.VERCEL) {
  process.on('beforeExit', disconnectPrisma)
}
