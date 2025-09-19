import { NextRequest, NextResponse } from 'next/server'

/**
 * Wrapper for API routes that prevents execution during build time
 * This helps avoid Prisma Client initialization errors during static generation
 */
export function buildSafeApiRoute(handler: (req: NextRequest, params?: any) => Promise<NextResponse>) {
  return async (req: NextRequest, params?: any) => {
    // During build time, return a placeholder response
    if (isBuildTime()) {
      return NextResponse.json({ message: 'Build time placeholder' }, { status: 200 })
    }

    try {
      return await handler(req, params)
    } catch (error) {
      console.error('API route error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}

/**
 * Check if we're in a build context
 */
export function isBuildTime(): boolean {
  // Check for various build-time indicators
  return (
    // Vercel build environment
    (process.env.VERCEL === '1' && !process.env.VERCEL_URL) ||
    // Next.js build phase
    process.env.NEXT_PHASE === 'phase-production-build' ||
    // General build indicators
    process.env.NODE_ENV === 'production' && !global.fetch
  )
}

/**
 * Safe Prisma client access that handles build time
 */
export async function safePrismaOperation<T>(operation: () => Promise<T>): Promise<T | null> {
  if (isBuildTime()) {
    console.warn('Skipping Prisma operation during build time')
    return null
  }

  try {
    return await operation()
  } catch (error) {
    console.error('Prisma operation failed:', error)
    throw error
  }
}
