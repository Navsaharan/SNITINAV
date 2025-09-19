import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with error handling for build time and serverless optimization
function createPrismaClient() {
  // Check if we're in a build context
  const isBuildTime = (
    (process.env.VERCEL === '1' && !process.env.VERCEL_URL) ||
    process.env.NEXT_PHASE === 'phase-production-build' ||
    (process.env.NODE_ENV === 'production' && !global.fetch) ||
    !process.env.DATABASE_URL
  )

  if (isBuildTime) {
    console.warn('Skipping Prisma Client creation during build time')
    return null as any
  }

  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty',
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
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
