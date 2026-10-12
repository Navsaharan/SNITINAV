import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with error handling for build time and serverless optimization
function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set')
    return null as any
  }

  try {
    // Normalize Supabase pooling parameters for Vercel serverless functions.
    const databaseUrl = new URL(process.env.DATABASE_URL)
    if (databaseUrl.hostname.includes('supabase')) {
      if (!databaseUrl.searchParams.has('sslmode')) {
        databaseUrl.searchParams.set('sslmode', 'require')
      }
      if (!databaseUrl.searchParams.has('pgbouncer')) {
        databaseUrl.searchParams.set('pgbouncer', 'true')
      }
      databaseUrl.searchParams.set('connection_limit', '5')
      databaseUrl.searchParams.set('pool_timeout', '20')
    }

    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: databaseUrl.toString()
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
